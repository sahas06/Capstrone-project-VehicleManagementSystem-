using Microsoft.AspNetCore.Identity;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Data
{
    public class RoleSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public RoleSeeder(RoleManager<IdentityRole> roleManager, IServiceProvider serviceProvider)
        {
            _roleManager = roleManager;
            _serviceProvider = serviceProvider;
        }

        public async Task SeedRoles()
        {
            string[] roles = { "Admin", "Manager", "Technician", "Customer" };

            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                    await _roleManager.CreateAsync(new IdentityRole(role));
            }

            // Seed Users
            await SeedUser("admin@example.com", "Admin@123", "Admin User", "Admin");
            await SeedUser("manager@example.com", "Manager@123", "Manager User", "Manager");
            await SeedUser("tech@example.com", "Tech@123", "Technician User", "Technician");
            await SeedUser("customer@example.com", "Cust@123", "Customer User", "Customer");
        }

        private async Task SeedUser(string email, string password, string fullName, string role)
        {
            var userManager = _serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    IsActive = true,
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(user, password);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, role);
                }
            }
        }
        
        private readonly IServiceProvider _serviceProvider;
        
        // Update constructor to inject IServiceProvider logic if needed, or use existing roleManager
        // Actually, RoleSeeder is registered as Scoped in Program.cs.
        // Let's check constructor.
        
        // Wait, I need UserManager. RoleSeeder currently only has RoleManager.
        // I need to update constructor too.
    }
}
