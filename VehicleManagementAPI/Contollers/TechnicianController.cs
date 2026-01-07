using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Data;
using VechileManagementAPI.DTOs;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/technician")]
    [Authorize(Roles = "Technician")]
    public class TechnicianController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly VechileManagementAPI.Services.INotificationService _notificationService;
        private readonly VechileManagementAPI.Services.IBillingService _billingService;

        public TechnicianController(AppDbContext context, UserManager<ApplicationUser> userManager, VechileManagementAPI.Services.IBillingService billingService, VechileManagementAPI.Services.INotificationService notificationService)
        {
            _context = context;
            _userManager = userManager;
            _billingService = billingService;
            _notificationService = notificationService;
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasks()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var tasks = await _context.ServiceRequests
                .Include(s => s.Vehicle)
                .Where(x => x.TechnicianId == userId && (x.Status == "Assigned" || x.Status == "In Progress"))
                .Select(s => new
                {
                    s.ServiceRequestId,
                    VehicleNumber = s.Vehicle != null ? s.Vehicle.RegistrationNumber : "N/A",
                    s.IssueDescription,
                    s.Status,
                    s.RequestDate,
                    s.Priority
                })
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpPut("services/{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var req = await _context.ServiceRequests
                .Include(r => r.Vehicle)
                .ThenInclude(v => v.Customer)
                .FirstOrDefaultAsync(r => r.ServiceRequestId == id);

            if (req == null) return NotFound();
            
            // SECURITY: Verify Ownership
            if (req.TechnicianId != userId) return Forbid();

            string oldStatus = req.Status;
            
            // Prevent double completion
            if (dto.Status == "Completed" && oldStatus == "Completed")
            {
                return BadRequest("Job is already completed.");
            }

            req.Status = dto.Status;

            // AUDIT: Log History
            _context.ServiceStatusHistories.Add(new ServiceStatusHistory
            {
                ServiceRequestId = req.ServiceRequestId,
                OldStatus = oldStatus,
                NewStatus = dto.Status,
                ChangedBy = userId,
                ChangedAt = DateTime.Now
            });

            // 🔔 NOTIFY CUSTOMER
            if (req.Vehicle?.Customer?.UserId != null)
            {
                await _notificationService.CreateNotificationAsync(
                    req.Vehicle.Customer.UserId, 
                    $"Your service request (ID: {req.ServiceRequestId}) status has been updated to: {dto.Status}"
                );
            }

            if (dto.Status == "Completed")
            {
                // DEDUCT INVENTORY ON COMPLETION
                var usedParts = await _context.ServiceRequestParts.Where(x => x.ServiceRequestId == id).ToListAsync();
                foreach (var item in usedParts)
                {
                    var part = await _context.Parts.FindAsync(item.PartId);
                    if (part != null)
                    {
                        part.StockQuantity -= item.Quantity; // Deduct now
                    }
                }

                await _billingService.GenerateBillAsync(id, userId);
            }

            await _context.SaveChangesAsync();
            return Ok(req);
        }

        [HttpGet("services/{id}/parts")]
        public async Task<IActionResult> GetUsedParts(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var req = await _context.ServiceRequests.FindAsync(id);
            if (req == null) return NotFound();

            // SECURITY: Verify Ownership
            if (req.TechnicianId != userId) return Forbid();

            var usedParts = await _context.ServiceRequestParts
                .Include(xp => xp.Part) // Assuming navigation property exists, otherwise join
                .Where(x => x.ServiceRequestId == id)
                .Select(x => new 
                {
                    x.PartId,
                    PartName = x.Part != null ? x.Part.PartName : "Unknown",
                    Price = x.Part != null ? x.Part.Price : 0m,
                    x.Quantity
                })
                .ToListAsync();

            return Ok(usedParts);
        }

        [HttpPost("services/{id}/parts")]
        public async Task<IActionResult> UseParts(int id, [FromBody] UsePartsDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var req = await _context.ServiceRequests.FindAsync(id);
            if (req == null) return NotFound();

            // SECURITY: Verify Ownership
            if (req.TechnicianId != userId) return Forbid();

            foreach (var p in dto.Parts)
            {
                _context.ServiceRequestParts.Add(new ServiceRequestPart
                {
                    ServiceRequestId = id,
                    PartId = p.PartId,
                    Quantity = p.Quantity
                });

                // DO NOT DEDUCT STOCK HERE. 
                // Stock is deducted only when status becomes "Completed".
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Parts used recorded" });
        }
    }

    public class StatusUpdateDto
    {
        public string Status { get; set; }
    }
}
