using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VechileManagementAPI.Models
{
    public class ServiceRequestPart
    {
        [Key]
        public int Id { get; set; }

        public int ServiceRequestId { get; set; }
        [JsonIgnore]
        public ServiceRequest ServiceRequest { get; set; }

        public int PartId { get; set; }
        public Part Part { get; set; }

        public int Quantity { get; set; }
    }
}
