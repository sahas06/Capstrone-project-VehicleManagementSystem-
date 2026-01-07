using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Data;
using VechileManagementAPI.DTOs;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<(ApplicationUser? user, string? error)> CreateUserAsync(CreateUserDto dto);
        Task<ApplicationUser?> UpdateUserAsync(string id, UpdateUserDto dto);
        Task<bool> DeactivateUserAsync(string id);
        Task<bool> ActivateUserAsync(string id);
        
        Task<IEnumerable<ServiceCategory>> GetAllCategoriesAsync();
        Task<ServiceCategory> CreateCategoryAsync(ServiceCategoryDto dto);
        Task<ServiceCategory?> UpdateCategoryAsync(int id, ServiceCategoryDto dto);
        Task<bool> DeleteCategoryAsync(int id);
    }

    public class AdminService : IAdminService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;

        public AdminService(UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // 🔹 USER MANAGEMENT
        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userManager.Users
                //.Where(u => u.IsActive) // Showing all users to Admin
                .ToListAsync();

            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    UserId = user.Id,
                    FullName = user.FullName ?? "",
                    Email = user.Email!,
                    Role = roles.FirstOrDefault() ?? "None",
                    IsActive = user.IsActive
                });
            }

            return userDtos;
        }

        public async Task<(ApplicationUser? user, string? error)> CreateUserAsync(CreateUserDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errorMsg = string.Join(", ", result.Errors.Select(e => e.Description));
                return (null, errorMsg);
            }

            await _userManager.AddToRoleAsync(user, dto.Role);

            // If Customer, create Customer profile
            if (dto.Role == "Customer")
            {
                var customer = new Customer { FullName = dto.FullName, UserId = user.Id };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            return (user, null);
        }

        public async Task<ApplicationUser?> UpdateUserAsync(string id, UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || !user.IsActive) return null;

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.UserName = dto.Email;
            
            // Note: Role update complexity omitted for brevity, assuming simple updates
            // In a real app, we'd remove old roles and add new ones.
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (!currentRoles.Contains(dto.Role))
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, dto.Role);
            }

            await _userManager.UpdateAsync(user);
            return user;
        }

        public async Task<bool> DeactivateUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return false;

            user.IsActive = false; // Soft delete
            await _userManager.UpdateAsync(user);
            return true;
        }

        public async Task<bool> ActivateUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return false;

            user.IsActive = true;
            await _userManager.UpdateAsync(user);
            return true;
        }

        // 🔹 SERVICE CATEGORY MANAGEMENT
        public async Task<IEnumerable<ServiceCategory>> GetAllCategoriesAsync()
        {
            return await _context.ServiceCategories.ToListAsync();
        }

        public async Task<ServiceCategory> CreateCategoryAsync(ServiceCategoryDto dto)
        {
            var category = new ServiceCategory
            {
                CategoryName = dto.CategoryName,
                Description = dto.Description,
                LabourCharge = dto.LabourCharge,
                EstimatedTimeHours = dto.EstimatedTimeHours,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Admin" // Simplified audit
            };

            _context.ServiceCategories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<ServiceCategory?> UpdateCategoryAsync(int id, ServiceCategoryDto dto)
        {
            var category = await _context.ServiceCategories.FindAsync(id);
            if (category == null) return null;

            category.CategoryName = dto.CategoryName;
            category.Description = dto.Description;
            category.LabourCharge = dto.LabourCharge;
            category.EstimatedTimeHours = dto.EstimatedTimeHours;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.ServiceCategories.FindAsync(id);
            if (category == null) return false;

            _context.ServiceCategories.Remove(category); // Hard delete for categories as per typical master data reqs, or could be soft. Req didn't specify for categories, only users.
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
