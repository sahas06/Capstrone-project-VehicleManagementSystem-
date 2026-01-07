namespace VechileManagementAPI.DTOs
{
    public class CustomerServiceHistoryDto
    {
        public int ServiceRequestId { get; set; }
        public string VehicleNumber { get; set; }
        public string IssueDescription { get; set; }
        public string Status { get; set; }
        public string? TechnicianName { get; set; }
        public DateTime RequestDate { get; set; }
    }
}
