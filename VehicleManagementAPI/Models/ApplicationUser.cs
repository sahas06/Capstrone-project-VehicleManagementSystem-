using Microsoft.AspNetCore.Identity;

namespace VechileManagementAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        public bool IsActive { get; set; } = true;
        public string? FullName { get; set; }
    }
}
