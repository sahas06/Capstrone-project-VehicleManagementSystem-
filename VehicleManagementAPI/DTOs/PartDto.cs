using System.ComponentModel.DataAnnotations;

namespace VechileManagementAPI.DTOs
{
    public class PartDto
    {
        public int PartId { get; set; }

        [Required]
        public string PartName { get; set; }

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }
    }
}
