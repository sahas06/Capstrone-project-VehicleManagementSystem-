using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VechileManagementAPI.Models
{
    public class ServiceStatusHistory
    {
        [Key]
        public int HistoryId { get; set; }

        public int ServiceRequestId { get; set; }

        [ForeignKey("ServiceRequestId")]
        public ServiceRequest? ServiceRequest { get; set; }

        public string OldStatus { get; set; }
        public string NewStatus { get; set; }

        public string? ChangedBy { get; set; } // UserId

        public DateTime ChangedAt { get; set; } = DateTime.Now;
    }
}
