using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Data;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Services
{
    public interface IBillingService
    {
        Task<Billing> GenerateBillAsync(int serviceRequestId, string userId);
        Task<Billing> ProcessPaymentAsync(int billingId);
    }

    public class BillingService : IBillingService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;

        public BillingService(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<Billing> GenerateBillAsync(int serviceRequestId, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Validation: Check if Bill Already Exists
                var existingBill = await _context.Billings
                    .FirstOrDefaultAsync(b => b.ServiceRequestId == serviceRequestId);
                
                if (existingBill != null)
                {
                    return existingBill;
                }

                // 2. Fetch Service Request with Dependencies to find Customer
                var serviceRequest = await _context.ServiceRequests
                    .Include(s => s.Vehicle)
                    .ThenInclude(v => v.Customer) // Need to reach Customer to get UserId
                    .FirstOrDefaultAsync(s => s.ServiceRequestId == serviceRequestId);

                if (serviceRequest == null) throw new Exception("Service Request not found");

                // 3. Status Validation
                if (serviceRequest.Status != "Completed")
                {
                    throw new InvalidOperationException("Bill can only be generated for Completed services.");
                }

                // 4. Calculate Costs
                var partsUsed = await _context.ServiceRequestParts
                    .Include(sp => sp.Part)
                    .Where(sp => sp.ServiceRequestId == serviceRequestId)
                    .ToListAsync();

                // 4a. Fetch Labour Cost from ServiceCategory
                var category = await _context.ServiceCategories
                    .FirstOrDefaultAsync(c => c.CategoryName == serviceRequest.ServiceType);
                
                // Fallback: If category not found, use a default charge (e.g., 500)
                decimal labourCharge = category?.LabourCharge ?? 500m;
                
                decimal partsCost = partsUsed.Sum(p => p.Quantity * p.Part.Price);
                
                decimal subTotal = partsCost + labourCharge;
                decimal taxRate = 0.18m;
                decimal taxAmount = subTotal * taxRate;
                decimal totalAmount = subTotal + taxAmount;

                // 5. Create Billing Record
                var bill = new Billing
                {
                    ServiceRequestId = serviceRequestId,
                    LabourCost = labourCharge,
                    PartsCost = partsCost,
                    TaxAmount = taxAmount,
                    TotalAmount = totalAmount,
                    PaymentStatus = "Pending",
                    DateGenerated = DateTime.Now,
                    CreatedAt = DateTime.Now,
                    CreatedBy = userId
                };

                _context.Billings.Add(bill);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Notify Customer
                // Verify Customer and UserId exists
                if (serviceRequest.Vehicle?.Customer != null)
                {
                    // "Your vehicle service is completed. Bill generated."
                    var custUserId = serviceRequest.Vehicle.Customer.UserId;
                    await _notificationService.CreateNotificationAsync(custUserId, $"Your vehicle service is completed. Bill generated (ID: {bill.BillingId}). Total: {totalAmount:C}");
                }

                return bill;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Billing> ProcessPaymentAsync(int billingId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var bill = await _context.Billings
                    .Include(b => b.ServiceRequest)
                    .ThenInclude(s => s.Vehicle)
                    .ThenInclude(v => v.Customer)
                    .FirstOrDefaultAsync(b => b.BillingId == billingId);

                if (bill == null) throw new Exception("Bill not found");

                if (bill.PaymentStatus == "Paid") return bill;

                bill.PaymentStatus = "Paid";
                
                if (bill.ServiceRequest != null)
                {
                    string oldStatus = bill.ServiceRequest.Status;
                    bill.ServiceRequest.Status = "Closed";
                    
                    // AUDIT: Log History
                    // Since this is a system/customer action, we can't easily get the User ID of the actor here without passing it.
                    // For now, we'll mark ChangedBy as "System" or leave it null/generic. 
                    // However, Customer pays it usually. 
                    // Let's assume passed userID or just 'System' for payment closure.
                    _context.ServiceStatusHistories.Add(new ServiceStatusHistory
                    {
                        ServiceRequestId = bill.ServiceRequestId,
                        OldStatus = oldStatus,
                        NewStatus = "Closed",
                        ChangedBy = "System", // Or "PaymentGateway"
                        ChangedAt = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Notify Customer
                if (bill.ServiceRequest?.Vehicle?.Customer != null)
                {
                    var custUserId = bill.ServiceRequest.Vehicle.Customer.UserId;
                    await _notificationService.CreateNotificationAsync(custUserId, $"Payment successful for Bill #{bill.BillingId}. Service Request is now Closed.");
                }

                return bill;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
