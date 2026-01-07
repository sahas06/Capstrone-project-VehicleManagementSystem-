using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.Models
{
    public class ServiceCategory
    {
        [Key]
        public int ServiceCategoryId { get; set; }

        [Required]
        public string CategoryName { get; set; }

        [MaxLength(200)]
        public string Description { get; set; }

        [Required]
        public decimal LabourCharge { get; set; }

        [Required]
        public int EstimatedTimeHours { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
    }
}
