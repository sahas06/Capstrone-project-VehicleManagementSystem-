using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string NewPassword { get; set; }
    }
}
