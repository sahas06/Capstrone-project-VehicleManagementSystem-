using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.DTOs
{
    public class ServiceRequestDto
    {
        [Required]
        public string IssueDescription { get; set; }

        [Required]
        public int VehicleId { get; set; }

        public string Priority { get; set; } = "Normal"; // Normal, Urgent

        public DateTime? RequestDate { get; set; }
    }
}
