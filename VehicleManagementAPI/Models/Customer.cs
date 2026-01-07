using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.Models
{
    public class Customer
    {
        public int CustomerId { get; set; }

        public string? FullName { get; set; }

        public string? Phone { get; set; }

        [Required]
        public string UserId { get; set; }
    }
}
