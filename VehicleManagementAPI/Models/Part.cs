using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VechileManagementAPI.Models
{
    public class Part
    {
        [Key]
        public int PartId { get; set; }

        [Required]
        public string PartName { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int StockQuantity { get; set; }
    }
}
