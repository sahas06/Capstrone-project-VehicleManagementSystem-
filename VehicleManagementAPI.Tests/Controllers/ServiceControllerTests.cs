using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using VechileManagementAPI.Controllers;
using VechileManagementAPI.Data;
using VechileManagementAPI.Models;
using VechileManagementAPI.Services;
using Xunit;

namespace VehicleManagementAPI.Tests.Controllers
{
    public class ServiceControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
        private readonly Mock<INotificationService> _mockNotificationService;
        private readonly AppDbContext _context;
        private readonly ServiceController _controller;

        public ServiceControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);

            var store = new Mock<IUserStore<ApplicationUser>>();
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);
            _mockNotificationService = new Mock<INotificationService>();

            _controller = new ServiceController(_context, _mockUserManager.Object, _mockNotificationService.Object);
        }

        private void SetupUser(string userId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, "Customer")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };

            var appUser = new ApplicationUser { Id = userId };
             _mockUserManager.Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>())).ReturnsAsync(appUser);
        }

        [Fact]
        public async Task CancelService_RequestedStatus_CancelsService()
        {
            // Arrange
            var userId = "cust-1";
            SetupUser(userId);

            var req = new ServiceRequest 
            { 
                ServiceRequestId = 1, 
                Status = "Requested", 
                Vehicle = new Vehicle { Customer = new Customer { UserId = userId }, Model = "M", RegistrationNumber = "R", VehicleType = "T" },
                IssueDescription = "Test"
            };
            _context.ServiceRequests.Add(req);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.CancelService(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedReq = await _context.ServiceRequests.FindAsync(1);
            Assert.Equal("Cancelled", updatedReq.Status);
        }

        [Fact]
        public async Task CancelService_AssignedStatus_ReturnsBadRequest()
        {
            // Arrange
            var userId = "cust-1";
            SetupUser(userId);

            var req = new ServiceRequest 
            { 
                ServiceRequestId = 1, 
                Status = "Assigned", 
                Vehicle = new Vehicle { Customer = new Customer { UserId = userId }, Model = "M", RegistrationNumber = "R", VehicleType = "T" },
                IssueDescription = "Test"
            };
            _context.ServiceRequests.Add(req);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.CancelService(1);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Status must be 'Requested'", badRequest.Value.ToString());
        }

        [Fact]
        public async Task RescheduleService_RequestedStatus_UpdatesDate()
        {
             // Arrange
            var userId = "cust-1";
            SetupUser(userId);

            var req = new ServiceRequest 
            { 
                ServiceRequestId = 1, 
                Status = "Requested", 
                Vehicle = new Vehicle { Customer = new Customer { UserId = userId }, Model = "M", RegistrationNumber = "R", VehicleType = "T" },
                IssueDescription = "Test"
            };
            _context.ServiceRequests.Add(req);
            await _context.SaveChangesAsync();

            var newDate = DateTime.UtcNow.AddDays(5);

            // Act
            var result = await _controller.RescheduleService(1, newDate);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedReq = await _context.ServiceRequests.FindAsync(1);
            Assert.Equal(newDate, updatedReq.RequestDate);
        }

        [Fact]
        public async Task RescheduleService_AssignedStatus_ReturnsBadRequest()
        {
            // Arrange
            var userId = "cust-1";
            SetupUser(userId);

            var req = new ServiceRequest 
            { 
                ServiceRequestId = 1, 
                Status = "Assigned", 
                Vehicle = new Vehicle { Customer = new Customer { UserId = userId }, Model = "M", RegistrationNumber = "R", VehicleType = "T" },
                IssueDescription = "Test"
            };
            _context.ServiceRequests.Add(req);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.RescheduleService(1, DateTime.Now);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Status must be 'Requested'", badRequest.Value.ToString());
        }
    }
}
