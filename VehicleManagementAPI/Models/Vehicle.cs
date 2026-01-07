using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VechileManagementAPI.Models
{
    public class Vehicle
    {
        public int VehicleId { get; set; }

        [Required]
        public string RegistrationNumber { get; set; }

        [Required]
        public string Model { get; set; }

        [Required]
        public string VehicleType { get; set; }

        public int CustomerId { get; set; }   // FK only

        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }   // <-- MUST be nullable
    }
}
