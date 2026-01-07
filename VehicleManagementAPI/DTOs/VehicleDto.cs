using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.DTOs
{
    public class VehicleDto
    {
        [Required]
        public string VehicleNumber { get; set; }

        [Required]
        public string Brand { get; set; }

        [Required]
        public string Model { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        public string VehicleType { get; set; }
    }
}
