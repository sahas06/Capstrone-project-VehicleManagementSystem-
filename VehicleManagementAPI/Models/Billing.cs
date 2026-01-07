using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VechileManagementAPI.Models
{
    public class Billing
    {
        [Key]
        public int BillingId { get; set; }

        [ForeignKey("ServiceRequest")]
        public int ServiceRequestId { get; set; }
        public ServiceRequest? ServiceRequest { get; set; }

        public decimal LabourCost { get; set; }
        public decimal PartsCost { get; set; }
        public decimal TaxAmount { get; set; } // 18% Tax
        public decimal TotalAmount { get; set; }

        public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid
        
        public DateTime DateGenerated { get; set; } = DateTime.Now;

        // Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; } = "System"; // User ID or "System"
    }
}
