using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using VechileManagementAPI.Controllers;
using VechileManagementAPI.Data;
using VechileManagementAPI.DTOs;
using VechileManagementAPI.Models;
using VechileManagementAPI.Services;
using Xunit;

namespace VehicleManagementAPI.Tests.Controllers
{
    public class TechnicianControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
        private readonly Mock<INotificationService> _mockNotificationService;
        private readonly Mock<IBillingService> _mockBillingService;
        private readonly AppDbContext _context;
        private readonly TechnicianController _controller;
        private readonly string _techId = "tech-123";

        public TechnicianControllerTests()
        {
            // Setup InMemory DB
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);

            // Mock Services
            var store = new Mock<IUserStore<ApplicationUser>>();
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);
            _mockNotificationService = new Mock<INotificationService>();
            _mockBillingService = new Mock<IBillingService>();

            _controller = new TechnicianController(_context, _mockUserManager.Object, _mockBillingService.Object, _mockNotificationService.Object);

            // Setup User Context
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, _techId),
                new Claim(ClaimTypes.Role, "Technician")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

        [Fact]
        public async Task GetTasks_ReturnsOnlyAssignedOrInProgressJobs()
        {
            // Arrange
            _context.ServiceRequests.AddRange(
                new ServiceRequest { ServiceRequestId = 1, TechnicianId = _techId, Status = "Assigned", Vehicle = new Vehicle { RegistrationNumber = "V1", Model = "M", VehicleType = "T" }, IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 2, TechnicianId = _techId, Status = "In Progress", Vehicle = new Vehicle { RegistrationNumber = "V2", Model = "M", VehicleType = "T" }, IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 3, TechnicianId = _techId, Status = "Completed", Vehicle = new Vehicle { RegistrationNumber = "V3", Model = "M", VehicleType = "T" }, IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 4, TechnicianId = "other-tech", Status = "Assigned", Vehicle = new Vehicle { RegistrationNumber = "V4", Model = "M", VehicleType = "T" }, IssueDescription = "Test" }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetTasks();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var tasks = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var taskList = tasks.ToList();
            Assert.Equal(2, taskList.Count); 
        }

        [Fact]
        public async Task UpdateStatus_ToInProgress_UpdatesStatus()
        {
            // Arrange
            var req = new ServiceRequest { ServiceRequestId = 1, TechnicianId = _techId, Status = "Assigned", IssueDescription = "Test", Vehicle = new Vehicle { Customer = new Customer { UserId = "c1" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" } };
            _context.ServiceRequests.Add(req);
            await _context.SaveChangesAsync();

            var dto = new StatusUpdateDto { Status = "In Progress" };

            // Act
            var result = await _controller.UpdateStatus(1, dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedReq = await _context.ServiceRequests.FindAsync(1);
            Assert.Equal("In Progress", updatedReq.Status);
        }

        [Fact]
        public async Task UpdateStatus_OtherTechJob_ReturnsForbid()
        {
            // Arrange
            var req = new ServiceRequest { ServiceRequestId = 1, TechnicianId = "other-tech", Status = "Assigned", IssueDescription = "Test", Vehicle = new Vehicle { Customer = new Customer { UserId = "c1" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" } };
            _context.ServiceRequests.Add(req);
            await _context.SaveChangesAsync();

            var dto = new StatusUpdateDto { Status = "In Progress" };

            // Act
            var result = await _controller.UpdateStatus(1, dto);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task UpdateStatus_ToCompleted_DeductsStockAndBills()
        {
            // Arrange
            var part = new Part { PartId = 1, StockQuantity = 10, Price = 100, PartName = "TestPart" };
            _context.Parts.Add(part);
            
            var req = new ServiceRequest { ServiceRequestId = 1, TechnicianId = _techId, Status = "In Progress", Vehicle = new Vehicle { Customer = new Customer { UserId = "cust-1" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" }, IssueDescription = "Test" };
            _context.ServiceRequests.Add(req);
            
            _context.ServiceRequestParts.Add(new ServiceRequestPart { ServiceRequestId = 1, PartId = 1, Quantity = 2 });
            await _context.SaveChangesAsync();

            var dto = new StatusUpdateDto { Status = "Completed" };

            // Act
            var result = await _controller.UpdateStatus(1, dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            
            // Verify Stock Deduction
            var updatedPart = await _context.Parts.FindAsync(1);
            Assert.Equal(8, updatedPart.StockQuantity); // 10 - 2

            // Verify Bill Generation Call
            _mockBillingService.Verify(x => x.GenerateBillAsync(1, _techId), Times.Once);
        }

        [Fact]
        public async Task UpdateStatus_CompletedJob_ReturnsBadRequest()
        {
            // Arrange
            var req = new ServiceRequest { ServiceRequestId = 1, TechnicianId = _techId, Status = "Completed", IssueDescription = "Test", Vehicle = new Vehicle { Customer = new Customer { UserId = "c1" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" } };
            _context.ServiceRequests.Add(req);
            await _context.SaveChangesAsync();

            var dto = new StatusUpdateDto { Status = "Completed" };

            // Act
            var result = await _controller.UpdateStatus(1, dto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Job is already completed.", badRequest.Value);
        }

        [Fact]
        public async Task UseParts_RecordsParts_DoesNotDeductStock()
        {
            // Arrange
            var part = new Part { PartId = 1, StockQuantity = 10, PartName = "TestPart" };
            _context.Parts.Add(part);
            var req = new ServiceRequest { ServiceRequestId = 1, TechnicianId = _techId, Status = "In Progress", IssueDescription = "Test", Vehicle = new Vehicle { Customer = new Customer { UserId = "c1" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" } };
            _context.ServiceRequests.Add(req);
            await _context.SaveChangesAsync();

            var dto = new UsePartsDto { Parts = new List<PartUsageItem> { new PartUsageItem { PartId = 1, Quantity = 5 } } };

            // Act
            var result = await _controller.UseParts(1, dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            
            // Verify ServiceRequestPart created
            var usage = await _context.ServiceRequestParts.FirstOrDefaultAsync(x => x.ServiceRequestId == 1 && x.PartId == 1);
            Assert.NotNull(usage);
             Assert.Equal(5, usage.Quantity);

            // Verify Stock UNCHANGED (until completion)
            var updatedPart = await _context.Parts.FindAsync(1);
            Assert.Equal(10, updatedPart.StockQuantity);
        }
    }
}
