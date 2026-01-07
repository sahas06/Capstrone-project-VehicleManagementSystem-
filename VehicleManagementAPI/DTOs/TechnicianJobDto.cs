namespace VechileManagementAPI.DTOs
{
    public class TechnicianJobDto
    {
        public int ServiceRequestId { get; set; }
        public string VehicleNumber { get; set; }
        public string IssueDescription { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; }
        public DateTime RequestDate { get; set; }
    }
}
