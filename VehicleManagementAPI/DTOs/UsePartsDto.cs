namespace VechileManagementAPI.DTOs
{
    public class PartUsageItem
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
    }

    public class UsePartsDto
    {
        public int ServiceRequestId { get; set; }
        public List<PartUsageItem> Parts { get; set; }
    }
}
