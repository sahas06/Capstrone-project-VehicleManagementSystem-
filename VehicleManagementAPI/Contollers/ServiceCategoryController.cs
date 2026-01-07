using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VechileManagementAPI.DTOs;
using VechileManagementAPI.Services;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/service-categories")]
    // Accessible by Admin for CUD, but maybe readable by others? Req says "Only Admin role can access these APIs" for Master Data.
    // However, booking service needs to see categories.
    // "Master Data" usually implies CUD is Admin only, Read is public/Customer.
    // But the requirement section 5B says "Add and manage customer...". Section 5C "Book service".
    // "Service Category" creates TYPES of services.
    // For now, I will restrict CUD to Admin. Read might handle differently or be kept open.
    // Req: "Only Admin role can access these APIs" (under Backend Rules for Admin Module).
    // This implies the MANAGEMENT APIs.
    // I will allow GET for Authenticated users (so Customers can see what to book), but POST/PUT/DELETE for Admin.
    public class ServiceCategoryController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public ServiceCategoryController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet]
        [Authorize] // Any logged in user
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _adminService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] ServiceCategoryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var category = await _adminService.CreateCategoryAsync(dto);
            return Ok(category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateServiceCategory(int id, [FromBody] ServiceCategoryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var category = await _adminService.UpdateCategoryAsync(id, dto);
            if (category == null) return NotFound();

            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var success = await _adminService.DeleteCategoryAsync(id);
            if (!success) return NotFound();

            return Ok(new { message = "Category deleted successfully" });
        }
    }
}
