using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string FullName { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }


    }
}

