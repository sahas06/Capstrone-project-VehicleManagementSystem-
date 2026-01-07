using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VechileManagementAPI.DTOs;
using VechileManagementAPI.Services;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (user, error) = await _adminService.CreateUserAsync(dto);
            if (user == null) return BadRequest(new { message = $"Failed to create user: {error}" });

            return Ok(new { message = "User created successfully", userId = user.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _adminService.UpdateUserAsync(id, dto);
            if (user == null) return NotFound("User not found or inactive.");

            return Ok(new { message = "User updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeactivateUser(string id)
        {
            var success = await _adminService.DeactivateUserAsync(id);
            if (!success) return NotFound("User not found.");

            return Ok(new { message = "User deactivated successfully" });
        }
        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> ActivateUser(string id)
        {
            var success = await _adminService.ActivateUserAsync(id);
            if (!success) return NotFound("User not found.");

            return Ok(new { message = "User activated successfully" });
        }
    }
}
