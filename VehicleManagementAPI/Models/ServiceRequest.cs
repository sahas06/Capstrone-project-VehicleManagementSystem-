using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VechileManagementAPI.Models
{
    public class ServiceRequest
    {
        public int ServiceRequestId { get; set; }

        [Required]
        public string IssueDescription { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTime RequestDate { get; set; } = DateTime.Now;

        public int VehicleId { get; set; }

        public Vehicle? Vehicle { get; set; }

        // 🔹 STAGE-4 FIELDS
        public string? TechnicianId { get; set; }
        public string? TechnicianName { get; set; }

        public string Priority { get; set; } = "Normal";

        // Added to support Reports and Manager updates
        public string ServiceType { get; set; } = "General Service"; 
        public DateTime? UpdatedAt { get; set; }
    }
}
