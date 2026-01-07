using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Data;
using VechileManagementAPI.Models;
using VechileManagementAPI.Services;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/billing")]
    [Authorize]
    public class BillingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IBillingService _billingService;

        public BillingController(AppDbContext context, UserManager<ApplicationUser> userManager, IBillingService billingService)
        {
            _context = context;
            _userManager = userManager;
            _billingService = billingService;
        }

        // CUSTOMER: View My Bills
        [HttpGet("my-bills")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> MyBills()
        {
            var user = await _userManager.GetUserAsync(User);
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == user.Id);
            
            if (customer == null) return BadRequest("Profile not found");

            var bills = await _context.Billings
                .Include(b => b.ServiceRequest)
                .ThenInclude(sr => sr.Vehicle)
                .Where(b => b.ServiceRequest.Vehicle.CustomerId == customer.CustomerId)
                .OrderByDescending(b => b.DateGenerated)
                .Select(b => new 
                {
                    b.BillingId,
                    Date = b.DateGenerated,
                    VehicleNumber = b.ServiceRequest.Vehicle != null ? b.ServiceRequest.Vehicle.RegistrationNumber : "N/A",
                    b.TotalAmount,
                    b.PaymentStatus
                })
                .ToListAsync();

            return Ok(bills);
        }

        // CUSTOMER: Pay Bill
        [HttpPost("pay/{billId}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> PayBill(int billId)
        {
            try 
            {
                var bill = await _billingService.ProcessPaymentAsync(billId);
                return Ok(new { message = "Payment Successful", bill });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        // GET INVOICE details
        [HttpGet("{billId}")]
        [Authorize]
        public async Task<IActionResult> GetBill(int billId)
        {
             var bill = await _context.Billings
                .Include(b => b.ServiceRequest)
                .ThenInclude(s => s.Vehicle)
                .ThenInclude(v => v.Customer)
                .FirstOrDefaultAsync(b => b.BillingId == billId);
                
             if(bill == null) return NotFound();

             var userId = _userManager.GetUserId(User);
             var roles = await _userManager.GetRolesAsync(await _userManager.GetUserAsync(User));
             
             // 1. Manager: Access All
             if (roles.Contains("Manager"))
             {
                 return Ok(bill);
             }

             // 2. Customer: Access Own Only
             if (roles.Contains("Customer"))
             {
                 if (bill.ServiceRequest.Vehicle.Customer.UserId != userId)
                     return Forbid();
                     
                 return Ok(bill);
             }

             // 3. Technician / Admin: No Access
             return Forbid();
        }
    }
}
