using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace VechileManagementAPI.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string UserId { get; set; } // FK to User
        public string Token { get; set; }
        public string JwtId { get; set; } // Map to Access Token JTI
        public bool IsUsed { get; set; } 
        public bool IsRevoked { get; set; } 
        public DateTime AddedDate { get; set; }
        public DateTime ExpiryDate { get; set; }

        [ForeignKey(nameof(UserId))]
        public ApplicationUser User { get; set; }
    }
}
