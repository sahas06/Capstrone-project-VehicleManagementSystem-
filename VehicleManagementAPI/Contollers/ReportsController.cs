using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Data;
using VechileManagementAPI.Models;
using VechileManagementAPI.DTOs;
using System.Linq;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize(Roles = "Manager")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        private IQueryable<ServiceRequest> ApplyFilters(
            IQueryable<ServiceRequest> query, 
            DateTime? from, DateTime? to, 
            string? category, string? technicianId, string? priority)
        {
            if (from.HasValue) query = query.Where(s => s.RequestDate >= from.Value);
            if (to.HasValue) query = query.Where(s => s.RequestDate <= to.Value);
            if (!string.IsNullOrEmpty(category)) query = query.Where(s => s.ServiceType == category);
            if (!string.IsNullOrEmpty(technicianId)) query = query.Where(s => s.TechnicianId == technicianId);
            if (!string.IsNullOrEmpty(priority)) query = query.Where(s => s.Priority == priority);
            
            return query;
        }

        [HttpGet("daily-trend")]
        public ActionResult<IEnumerable<ManagerReportDto>> GetDailyServiceTrend(DateTime? from, DateTime? to, string? category, string? technicianId, string? priority)
        {
            var query = ApplyFilters(_context.ServiceRequests, from, to, category, technicianId, priority);

            var data = query
                .GroupBy(s => s.RequestDate.Date)
                .Select(g => new 
                { 
                    Date = g.Key, 
                    Count = g.Count() 
                })
                .OrderBy(x => x.Date)
                .ToList();

            var result = data.Select(x => new ManagerReportDto
            {
                Label = x.Date.ToString("yyyy-MM-dd"),
                Value = x.Count
            });

            return Ok(result);
        }

        [HttpGet("monthly-revenue")]
        public ActionResult<IEnumerable<ManagerReportDto>> GetMonthlyRevenue(DateTime? from, DateTime? to, string? category, string? technicianId, string? priority)
        {
            var query = _context.Billings.Include(b => b.ServiceRequest).AsQueryable();

            if (from.HasValue) query = query.Where(b => b.DateGenerated >= from.Value);
            if (to.HasValue) query = query.Where(b => b.DateGenerated <= to.Value);
            if (!string.IsNullOrEmpty(category)) query = query.Where(b => b.ServiceRequest.ServiceType == category);
            if (!string.IsNullOrEmpty(technicianId)) query = query.Where(b => b.ServiceRequest.TechnicianId == technicianId);
            if (!string.IsNullOrEmpty(priority)) query = query.Where(b => b.ServiceRequest.Priority == priority);

            var data = query
                .GroupBy(b => new { b.DateGenerated.Year, b.DateGenerated.Month })
                .Select(g => new 
                { 
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Total = g.Sum(x => x.TotalAmount)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToList();

            var result = data.Select(x => new ManagerReportDto
            {
                Label = $"{x.Year}-{x.Month:D2}",
                Value = (double)x.Total
            });

            return Ok(result);


        }

        [HttpGet("technician-performance")]
        public ActionResult<IEnumerable<ManagerReportDto>> GetTechnicianPerformance(DateTime? from, DateTime? to, string? category, string? priority)
        {
            // Filter completed jobs assigned to a technician
            var query = _context.ServiceRequests
                .Where(s => s.Status == "Completed" && s.TechnicianName != null);

            query = ApplyFilters(query, from, to, category, null, priority);

            var data = query
                .GroupBy(s => s.TechnicianName)
                .Select(g => new ManagerReportDto
                { 
                    Label = g.Key!, 
                    Value = g.Count() 
                })
                .ToList();

            return Ok(data);
        }

        [HttpGet("status-distribution")]
        public ActionResult<IEnumerable<ManagerReportDto>> GetStatusDistribution(DateTime? from, DateTime? to, string? category, string? technicianId, string? priority)
        {
            var query = ApplyFilters(_context.ServiceRequests, from, to, category, technicianId, priority);

            var data = query
                .GroupBy(s => s.Status)
                .Select(g => new ManagerReportDto
                { 
                    Label = g.Key, 
                    Value = g.Count() 
                })
                .ToList();

            return Ok(data);
        }

        [HttpGet("category-analysis")]
        public ActionResult<IEnumerable<ManagerReportDto>> GetServiceCategoryAnalysis(DateTime? from, DateTime? to, string? technicianId, string? priority)
        {
            var query = _context.ServiceRequests.AsQueryable();
            // Don't filter by category here as that's the dimension we are analyzing
            if (from.HasValue) query = query.Where(s => s.RequestDate >= from.Value);
            if (to.HasValue) query = query.Where(s => s.RequestDate <= to.Value);
            if (!string.IsNullOrEmpty(technicianId)) query = query.Where(s => s.TechnicianId == technicianId);
            if (!string.IsNullOrEmpty(priority)) query = query.Where(s => s.Priority == priority);

            var data = query
                .GroupBy(s => s.ServiceType)
                .Select(g => new ManagerReportDto
                { 
                    Label = g.Key, 
                    Value = g.Count() 
                })
                .ToList();

            return Ok(data);
        }
    }
}
