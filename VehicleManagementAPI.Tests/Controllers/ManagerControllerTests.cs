using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
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
    public class ManagerControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
        private readonly Mock<INotificationService> _mockNotificationService;
        private readonly AppDbContext _context;
        private readonly ManagerController _controller;

        public ManagerControllerTests()
        {
            // Setup InMemory DB
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;
            _context = new AppDbContext(options);

            // Mock UserManager
            var store = new Mock<IUserStore<ApplicationUser>>();
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);

            // Mock NotificationService
            _mockNotificationService = new Mock<INotificationService>();

            _controller = new ManagerController(_context, _mockUserManager.Object, _mockNotificationService.Object);

            // Setup Controller Context for User
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "manager-id"),
                new Claim(ClaimTypes.Role, "Manager")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

        [Fact]
        public async Task AssignTechnician_ValidRequest_AssignsTechnician()
        {
            // Arrange
            var techId = "tech-1";
            var request = new ServiceRequest { ServiceRequestId = 1, Status = "Requested", Vehicle = new Vehicle { Customer = new Customer { UserId = "cust-1" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" }, IssueDescription = "Test" };
            _context.ServiceRequests.Add(request);
            await _context.SaveChangesAsync();

            var tech = new ApplicationUser { Id = techId, UserName = "tech1", FullName = "Technician One", IsActive = true };
            _mockUserManager.Setup(x => x.FindByIdAsync(techId)).ReturnsAsync(tech);
            _mockUserManager.Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>())).ReturnsAsync(new ApplicationUser { Id = "manager-id" });
            
            // Act
            var result = await _controller.AssignTechnician(1, techId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedRequest = await _context.ServiceRequests.FindAsync(1);
            Assert.Equal("Assigned", updatedRequest.Status);
            Assert.Equal(techId, updatedRequest.TechnicianId);
        }

        [Fact]
        public async Task AssignTechnician_NonRequestedStatus_ReturnsBadRequest()
        {
            // Arrange
            var reqId = 2;
            var request = new ServiceRequest { ServiceRequestId = reqId, Status = "Assigned", Vehicle = new Vehicle { Customer = new Customer { UserId = "cust-1" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" }, IssueDescription = "Test" };
            _context.ServiceRequests.Add(request);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.AssignTechnician(reqId, "some-tech");

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("already Assigned", badRequest.Value.ToString());
        }

        [Fact]
        public async Task AssignTechnician_TechnicianOverloaded_ReturnsBadRequest()
        {
            // Arrange
            var techId = "tech-busy";
            var tech = new ApplicationUser { Id = techId, UserName = "busy", FullName = "Busy Tech", IsActive = true };
            _mockUserManager.Setup(x => x.FindByIdAsync(techId)).ReturnsAsync(tech);

            // 3 active jobs
            _context.ServiceRequests.AddRange(
                new ServiceRequest { ServiceRequestId = 10, TechnicianId = techId, Status = "Assigned", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 11, TechnicianId = techId, Status = "Assigned", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 12, TechnicianId = techId, Status = "In Progress", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 13, Status = "Requested", Vehicle = new Vehicle { Customer = new Customer { UserId = "cust-1" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" }, IssueDescription = "Test" }
            );
            await _context.SaveChangesAsync();
            
            // Setup other techs (none available to force "overloaded" message, or check specific logic)
            // Implementation logic: if target is full, check global. If others available -> return "Technician overloaded".
            // If ALL full -> "No technician currently available".
            
            // Let's mock another tech who IS available to ensure we get the "Technician overloaded" message specific to this tech
            var otherTech = new ApplicationUser { Id = "tech-free", IsActive = true };
            _mockUserManager.Setup(x => x.GetUsersInRoleAsync("Technician"))
                .ReturnsAsync(new List<ApplicationUser> { tech, otherTech });

            // Act
            var result = await _controller.AssignTechnician(13, techId);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Technician overloaded. Cannot assign more than 3 active jobs.", badRequest.Value);
        }

        [Fact]
        public async Task AssignTechnician_AllTechniciansOverloaded_ReturnsNoAvailable()
        {
            // Arrange
            var tech1 = new ApplicationUser { Id = "t1", IsActive = true };
            var tech2 = new ApplicationUser { Id = "t2", IsActive = true };
             _mockUserManager.Setup(x => x.FindByIdAsync("t1")).ReturnsAsync(tech1);
            _mockUserManager.Setup(x => x.GetUsersInRoleAsync("Technician"))
                .ReturnsAsync(new List<ApplicationUser> { tech1, tech2 });

            // Both full
            _context.ServiceRequests.AddRange(
                new ServiceRequest { ServiceRequestId = 101, TechnicianId = "t1", Status = "Assigned", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 102, TechnicianId = "t1", Status = "Assigned", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 103, TechnicianId = "t1", Status = "Assigned", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 201, TechnicianId = "t2", Status = "Assigned", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 202, TechnicianId = "t2", Status = "Assigned", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 203, TechnicianId = "t2", Status = "Assigned", IssueDescription = "Test" },
                new ServiceRequest { ServiceRequestId = 999, Status = "Requested", IssueDescription = "Test" }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.AssignTechnician(999, "t1");

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No technician currently available", badRequest.Value);
        }

        [Fact]
        public async Task GetLowStockParts_ReturnsOnlyLowStock()
        {
            // Arrange
            _context.Parts.AddRange(
                new Part { PartId = 1, PartName = "Low", StockQuantity = 3, Price = 10 },
                new Part { PartId = 2, PartName = "High", StockQuantity = 10, Price = 10 }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = _controller.GetLowStockParts();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var parts = Assert.IsType<List<Part>>(okResult.Value);
            Assert.Single(parts);
            Assert.Equal("Low", parts[0].PartName);
        }
        
        // Security Tests via Reflection
        [Fact]
        public void AddPart_HasAuthorizeManagerAttribute()
        {
            var method = typeof(ManagerController).GetMethod("AddPart");
            var attributes = method.GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), false);
            Assert.NotEmpty(attributes);
            var authAttr = (Microsoft.AspNetCore.Authorization.AuthorizeAttribute)attributes[0];
            Assert.Equal("Manager", authAttr.Roles);
        }

        [Fact]
        public void GetParts_HasAuthorizeManagerOrTechnicianAttribute()
        {
             var method = typeof(ManagerController).GetMethod("GetParts");
            var attributes = method.GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), false);
            Assert.NotEmpty(attributes);
            var authAttr = (Microsoft.AspNetCore.Authorization.AuthorizeAttribute)attributes[0];
            Assert.Contains("Manager", authAttr.Roles);
            Assert.Contains("Technician", authAttr.Roles);
        }
    }
}
