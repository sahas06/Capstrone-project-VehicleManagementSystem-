using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Data;
using VechileManagementAPI.Models;
using VechileManagementAPI.DTOs;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/services")]
    [Authorize]
    public class ServiceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly VechileManagementAPI.Services.INotificationService _notificationService;

        public ServiceController(AppDbContext context, UserManager<ApplicationUser> userManager, VechileManagementAPI.Services.INotificationService notificationService)
        {
            _context = context;
            _userManager = userManager;
            _notificationService = notificationService;
        }

        // 📌 BOOK SERVICE
        [HttpPost("book")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> BookService([FromBody] ServiceRequestDto requestDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized("User not found.");

            var customer = _context.Customers
                .FirstOrDefault(c => c.UserId == user.Id);

            if (customer == null)
                return BadRequest("Customer profile not created.");

            // Validate Vehicle belongs to Customer
            var vehicle = _context.Vehicles
                .FirstOrDefault(v => v.VehicleId == requestDto.VehicleId && v.CustomerId == customer.CustomerId);

            if (vehicle == null)
                return BadRequest("Invalid Vehicle ID.");

            var serviceRequest = new ServiceRequest
            {
                VehicleId = requestDto.VehicleId,
                IssueDescription = requestDto.IssueDescription,
                Priority = requestDto.Priority,
                Status = "Requested",
                RequestDate = requestDto.RequestDate ?? DateTime.Now
            };

            _context.ServiceRequests.Add(serviceRequest);
            await _context.SaveChangesAsync();

            // Notify Customer
            await _notificationService.CreateNotificationAsync(user.Id, $"Your service request has been booked. ID: {serviceRequest.ServiceRequestId}");

            return Ok(serviceRequest);
        }

        // 📌 VIEW MY SERVICE HISTORY
        [HttpGet("history")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> MyHistory()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized("User not found.");

            var customer = _context.Customers
                .FirstOrDefault(c => c.UserId == user.Id);

            var history = _context.ServiceRequests
                .Include(s => s.Vehicle)
                .Where(s => s.Vehicle.CustomerId == customer.CustomerId)
                .Select(s => new CustomerServiceHistoryDto
                {
                    ServiceRequestId = s.ServiceRequestId,
                    VehicleNumber = s.Vehicle.RegistrationNumber,
                    IssueDescription = s.IssueDescription,
                    Status = s.Status,
                    TechnicianName = s.TechnicianName,
                    RequestDate = s.RequestDate
                })
                .ToList();

            return Ok(history);
        }
        [HttpGet("{id}/history")]
        [Authorize]
        public async Task<IActionResult> GetHistory(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized("User not found.");

            var request = await _context.ServiceRequests.FindAsync(id);

            if (request == null) return NotFound();

            // Security: Allow Admin, Manager, Technician, or Owner
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            var isManager = await _userManager.IsInRoleAsync(user, "Manager");
            var isTechnician = await _userManager.IsInRoleAsync(user, "Technician");
            
            // For owner check, we need to load Vehicle->Customer->UserId
            // But simplified: If not admin/manager/tech, check ownership (this might need Include)
            if (!isAdmin && !isManager && !isTechnician)
            {
                 var reqWithOwner = await _context.ServiceRequests
                    .Include(r => r.Vehicle)
                    .ThenInclude(v => v.Customer)
                    .FirstOrDefaultAsync(r => r.ServiceRequestId == id);
                 
                 if (reqWithOwner?.Vehicle?.Customer?.UserId != user.Id)
                 {
                     return Forbid();
                 }
            }

            var history = await _context.ServiceStatusHistories
                .Where(h => h.ServiceRequestId == id)
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new 
                {
                    h.HistoryId,
                    h.OldStatus,
                    h.NewStatus,
                    h.ChangedBy,
                    h.ChangedAt
                })
                .ToListAsync();

            return Ok(history);
        }
        // 📌 CUSTOMER DASHBOARD STATS
        [HttpGet("stats")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == user.Id);
            if (customer == null) return BadRequest("Customer profile not found");

            var activeServices = await _context.ServiceRequests
                .CountAsync(s => s.Vehicle.CustomerId == customer.CustomerId && s.Status != "Completed" && s.Status != "Cancelled");

            var myVehicles = await _context.Vehicles
                .CountAsync(v => v.CustomerId == customer.CustomerId);

            var pendingBills = await _context.Billings
                .Include(b => b.ServiceRequest)
                .ThenInclude(s => s.Vehicle)
                .CountAsync(b => b.ServiceRequest.Vehicle.CustomerId == customer.CustomerId && b.PaymentStatus == "Pending");

            return Ok(new 
            {
                ActiveServices = activeServices,
                MyVehicles = myVehicles,
                PendingBills = pendingBills
            });
        }
        // 📌 CANCEL SERVICE
        [HttpPut("cancel/{id}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CancelService(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized("User not found.");

            var request = await _context.ServiceRequests
                .Include(r => r.Vehicle)
                .ThenInclude(v => v.Customer)
                .FirstOrDefaultAsync(r => r.ServiceRequestId == id);

            if (request == null) return NotFound("Service Request not found.");

            // Ownership Check
            if (request.Vehicle.Customer.UserId != user.Id)
                return Forbid();

            // Status Check
            if (request.Status != "Requested")
                return BadRequest("Cannot cancel service. Status must be 'Requested'.");

            string oldStatus = request.Status;
            request.Status = "Cancelled";
            request.UpdatedAt = DateTime.Now;

            // Audit
             _context.ServiceStatusHistories.Add(new ServiceStatusHistory
            {
                ServiceRequestId = request.ServiceRequestId,
                OldStatus = oldStatus,
                NewStatus = "Cancelled",
                ChangedBy = user.Id,
                ChangedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Service Cancelled Successfully" });
        }

        // 📌 RESCHEDULE SERVICE
        [HttpPut("reschedule/{id}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> RescheduleService(int id, [FromBody] DateTime newDate)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized("User not found.");

            var request = await _context.ServiceRequests
                .Include(r => r.Vehicle)
                .ThenInclude(v => v.Customer)
                .FirstOrDefaultAsync(r => r.ServiceRequestId == id);

            if (request == null) return NotFound("Service Request not found.");

            // Ownership Check
            if (request.Vehicle.Customer.UserId != user.Id)
                return Forbid();

            // Status Check
            if (request.Status != "Requested")
                return BadRequest("Cannot reschedule service. Status must be 'Requested'.");

            request.RequestDate = newDate;
            request.UpdatedAt = DateTime.Now;
            // Note: We don't change status, just date.

            await _context.SaveChangesAsync();
            return Ok(new { message = "Service Rescheduled Successfully", newDate = request.RequestDate });
        }
    }
}
