using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Data
{
    public class AdminSeeder
    {
        public static async Task SeedAdminAsync(IServiceProvider services)
        {
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var config = services.GetRequiredService<IConfiguration>();
            var context = services.GetRequiredService<AppDbContext>();

            // 1. Roles
            string[] roles = { "Admin", "Manager", "Technician", "Customer" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 2. Admin User
            var adminEmail = config["AdminSeed:Email"] ?? "admin@example.com";
            var adminPass = config["AdminSeed:Password"] ?? "Admin@123";

            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new ApplicationUser { UserName = adminEmail, Email = adminEmail, FullName = "System Admin", IsActive = true, EmailConfirmed = true };
                var res = await userManager.CreateAsync(admin, adminPass);
                if (res.Succeeded) await userManager.AddToRoleAsync(admin, "Admin");
            }

            // 3. Default Manager
            if (await userManager.FindByEmailAsync("manager@example.com") == null)
            {
                var manager = new ApplicationUser { UserName = "manager@example.com", Email = "manager@example.com", FullName = "Default Manager", IsActive = true, EmailConfirmed = true };
                var res = await userManager.CreateAsync(manager, "Manager@123");
                if (res.Succeeded) await userManager.AddToRoleAsync(manager, "Manager");
            }

            // 4. Default Technician
            if (await userManager.FindByEmailAsync("tech@example.com") == null)
            {
                var tech = new ApplicationUser { UserName = "tech@example.com", Email = "tech@example.com", FullName = "Default Technician", IsActive = true, EmailConfirmed = true };
                var res = await userManager.CreateAsync(tech, "Tech@123");
                if (res.Succeeded) await userManager.AddToRoleAsync(tech, "Technician");
            }

            // 5. Default Customer
            if (await userManager.FindByEmailAsync("customer@example.com") == null)
            {
                var cust = new ApplicationUser { UserName = "customer@example.com", Email = "customer@example.com", FullName = "Default Customer", IsActive = true, EmailConfirmed = true };
                var res = await userManager.CreateAsync(cust, "Cust@123");
                if (res.Succeeded) await userManager.AddToRoleAsync(cust, "Customer");

                // Create Customer Profile
                if (!context.Customers.Any(c => c.UserId == cust.Id))
                {
                    context.Customers.Add(new Customer { UserId = cust.Id, Phone = "555-0101", FullName = "Default Customer" });
                }
            }

            // 6. Service Categories
            if (!context.ServiceCategories.Any())
            {
                context.ServiceCategories.Add(new ServiceCategory { CategoryName = "General Service", Description = "Oil change, filters checks", LabourCharge = 50.00m, EstimatedTimeHours = 2, CreatedBy = "System" });
                context.ServiceCategories.Add(new ServiceCategory { CategoryName = "Brake Repair", Description = "Brake pads replacement", LabourCharge = 120.00m, EstimatedTimeHours = 3, CreatedBy = "System" });
            }

            // 7. Parts
            if (!context.Parts.Any())
            {
                context.Parts.Add(new Part { PartName = "Engine Oil (Synthetic)", Price = 45.00m, StockQuantity = 100 });
                context.Parts.Add(new Part { PartName = "Brake Pads", Price = 80.00m, StockQuantity = 4 }); // Low Stock Example
            }

            await context.SaveChangesAsync();
        }
    }
}
