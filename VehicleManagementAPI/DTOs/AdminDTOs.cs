using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.DTOs
{
    public class UserDto
    {
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateUserDto
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(8)]
        public string Password { get; set; }

        [Required]
        public string Role { get; set; }
    }

    public class UpdateUserDto
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Role { get; set; }
    }

    public class ServiceCategoryDto
    {
        [Required]
        public string CategoryName { get; set; }

        public string Description { get; set; }

        [Required]
        public decimal LabourCharge { get; set; }

        [Required]
        public int EstimatedTimeHours { get; set; }
    }
}
