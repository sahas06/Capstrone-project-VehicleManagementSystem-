using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.DTOs
{
    public class TokenRequestDto
    {
        [Required]
        public string Token { get; set; }
        
        [Required]
        public string RefreshToken { get; set; }
    }
}
