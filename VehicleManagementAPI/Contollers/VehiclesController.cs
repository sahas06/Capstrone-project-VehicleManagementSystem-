using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VechileManagementAPI.Data;
using VechileManagementAPI.DTOs;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Controllers
{
    [Authorize(Roles = "Customer")]
    [ApiController]
    [Route("api/vehicles")]
    public class VehiclesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public VehiclesController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ➕ Add Vehicle
        [HttpPost]
        public async Task<IActionResult> AddVehicle([FromBody] VehicleDto dto)
        {
            string step = "Start";
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                step = "GetUser";
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                    return Unauthorized("User not found");

                step = "GetCustomer";
                // Explicitly select fields to avoid mapping issues if any
                var customer = _context.Customers.FirstOrDefault(c => c.UserId == user.Id);
                
                if (customer == null)
                    return BadRequest("Customer profile not found");

                step = "CreateVehicle";
                var vehicle = new Vehicle
                {
                    RegistrationNumber = dto.VehicleNumber,
                    Model = $"{dto.Brand} {dto.Model} ({dto.Year})",
                    VehicleType = dto.VehicleType,
                    CustomerId = customer.CustomerId
                };

                step = "SaveVehicle";
                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();

                return Ok(vehicle);
            }
            catch (Exception ex)
            {
                // Return the step where it failed
                return StatusCode(500, new { step = step, message = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        // 📋 My Vehicles
        [HttpGet]
        public async Task<IActionResult> MyVehicles()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var customer = _context.Customers.FirstOrDefault(c => c.UserId == user.Id);
            if (customer == null)
                return BadRequest("Customer profile not found");

            var vehicles = _context.Vehicles
                .Where(v => v.CustomerId == customer.CustomerId)
                .ToList();

            return Ok(vehicles);
        }
    }
}
