using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VechileManagementAPI.Data;
using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Models;
using VechileManagementAPI.DTOs;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/manager")]
    [Authorize]
    public class ManagerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly VechileManagementAPI.Services.INotificationService _notificationService;

        public ManagerController(AppDbContext context, UserManager<ApplicationUser> userManager, VechileManagementAPI.Services.INotificationService notificationService)
        {
            _context = context;
            _userManager = userManager;
            _notificationService = notificationService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var newRequests = await _context.ServiceRequests.CountAsync(r => r.Status == "Requested");
            var techs = await _userManager.GetUsersInRoleAsync("Technician");
            var activeTechs = techs.Count(t => t.IsActive);
            var closedThisMonth = await _context.ServiceRequests.CountAsync(r => r.Status == "Completed" && r.UpdatedAt >= startOfMonth);
            var revenue = await _context.Billings.Where(b => b.DateGenerated >= startOfMonth).SumAsync(b => (decimal?)b.TotalAmount) ?? 0;
            return Ok(new { NewRequests = newRequests, ActiveTechnicians = activeTechs, ClosedThisMonth = closedThisMonth, Revenue = revenue });
        }

        [HttpGet("requests")]
        public IActionResult GetPendingRequests()
        {
            var data = _context.ServiceRequests
                .Include(x => x.Vehicle)
                .Where(x => x.Status == "Requested" || x.Status == "Assigned")
                .ToList();

            return Ok(data);
        }

        [HttpGet("technicians")]
        public async Task<IActionResult> GetActiveTechnicians()
        {
            var technicians = await _userManager.GetUsersInRoleAsync("Technician");
            var activeTechs = technicians
                .Where(t => t.IsActive) // STIRC Check: Only Active Technicians
                .Select(t => new 
                { 
                    t.Id, 
                    t.FullName, 
                    t.Email 
                });
            return Ok(activeTechs);
        }

        [HttpGet("technicians/availability")]
        public async Task<IActionResult> GetTechnicianAvailability()
        {
            var technicians = await _userManager.GetUsersInRoleAsync("Technician");
            
            // Filter inactive
            var activeTechs = technicians.Where(t => t.IsActive).ToList();
            
            var availabilityList = new List<TechnicianAvailabilityDto>();

            foreach (var t in activeTechs)
            {
                var activeJobs = await _context.ServiceRequests.CountAsync(sr => 
                    sr.TechnicianId == t.Id && 
                    (sr.Status == "Assigned" || sr.Status == "In Progress"));

                availabilityList.Add(new TechnicianAvailabilityDto
                {
                    TechnicianId = t.Id,
                    TechnicianName = t.FullName,
                    ActiveJobs = activeJobs
                });
            }

            return Ok(availabilityList);
        }

        [Authorize(Roles = "Manager")]
        [HttpPut("assign/{id}")]
        public async Task<IActionResult> AssignTechnician(int id, [FromBody] string technicianId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var request = await _context.ServiceRequests.FindAsync(id);
                if (request == null) return NotFound("Service Request not found");

                // Validate Status to avoid race condition
                if (request.Status != "Requested")
                    return BadRequest($"Request is already {request.Status}. Must be 'Requested' to assign.");

                string oldStatus = request.Status;

                var tech = await _userManager.FindByIdAsync(technicianId);
                if (tech == null || !tech.IsActive) return BadRequest("Invalid or Inactive Technician");

                // CHECK WORKLOAD
                var activeJobs = await _context.ServiceRequests.CountAsync(sr => 
                    sr.TechnicianId == tech.Id && 
                    (sr.Status == "Assigned" || sr.Status == "In Progress"));
                
                if (activeJobs >= 3)
                {
                    // Global Check: Are ALL technicians overloaded?
                    var allTechs = await _userManager.GetUsersInRoleAsync("Technician");
                    bool anyAvailable = false;
                    
                    foreach (var t in allTechs)
                    {
                        if (!t.IsActive) continue;
                        if (t.Id == tech.Id) continue; // Already known full

                        var tJobs = await _context.ServiceRequests.CountAsync(sr => 
                            sr.TechnicianId == t.Id && 
                            (sr.Status == "Assigned" || sr.Status == "In Progress"));
                        
                        if (tJobs < 3)
                        {
                            anyAvailable = true;
                            break;
                        }
                    }

                    if (!anyAvailable)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest("No technician currently available");
                    }

                    await transaction.RollbackAsync();
                    return BadRequest("Technician overloaded. Cannot assign more than 3 active jobs.");
                }

                request.TechnicianId = tech.Id;
                request.TechnicianName = tech.FullName ?? tech.Email;
                request.Status = "Assigned";
                request.UpdatedAt = DateTime.UtcNow;

                // AUDIT: Log History
                var manager = await _userManager.GetUserAsync(User);
                _context.ServiceStatusHistories.Add(new ServiceStatusHistory
                {
                    ServiceRequestId = request.ServiceRequestId,
                    OldStatus = oldStatus,
                    NewStatus = "Assigned",
                    ChangedBy = manager?.Id ?? "Unknown", 
                    ChangedAt = DateTime.Now
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Notify Technician
                await _notificationService.CreateNotificationAsync(tech.Id, $"A new service task has been assigned to you. Request ID: {id}");

                return Ok(new { message = "Technician assigned successfully" });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw; // ExceptionMiddleware will handle it
            }
        }

        // ==========================================
        // PARTS INVENTORY MANAGEMENT (Moved from PartsController)
        // ==========================================

        [Authorize(Roles = "Manager,Technician")]
        [HttpGet("parts")]
        public IActionResult GetParts()
        {
            // Assuming Manager can see all parts. 
            // Previous PartsController.GetParts was public/unprotected?
            // User requirement: "Protect all parts routes... role = Manager"
            // So this inherits [Authorize(Roles="Manager")] from class.
            return Ok(_context.Parts.ToList());
        }

        [Authorize(Roles = "Manager")]
        [HttpPost("parts")]
        public IActionResult AddPart([FromBody] PartDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var part = new Part
            {
                PartName = dto.PartName,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity
            };

            _context.Parts.Add(part);
            _context.SaveChanges();
            return Ok(part);
        }

        [Authorize(Roles = "Manager")]
        [HttpPut("parts/{id}")]
        public IActionResult UpdatePart(int id, [FromBody] PartDto dto)
        {
            var part = _context.Parts.Find(id);
            if (part == null) return NotFound();

            part.PartName = dto.PartName;
            part.Price = dto.Price;
            part.StockQuantity = dto.StockQuantity;

            _context.SaveChanges();
            return Ok(part);
        }

        [Authorize(Roles = "Manager")]
        [HttpDelete("parts/{id}")]
        public IActionResult DeletePart(int id)
        {
            var part = _context.Parts.Find(id);
            if (part == null) return NotFound();

            _context.Parts.Remove(part);
            _context.SaveChanges();
            return Ok(new { message = "Part deleted successfully" });
        }

        [Authorize(Roles = "Manager")]
        [HttpGet("parts/low-stock")]
        public IActionResult GetLowStockParts()
        {
            var lowStockParts = _context.Parts
                .Where(p => p.StockQuantity < 5)
                .ToList();
            return Ok(lowStockParts);
        }
    }
}
