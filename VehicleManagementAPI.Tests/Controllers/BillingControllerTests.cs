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
    public class BillingControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
        private readonly Mock<IBillingService> _mockBillingService;
        private readonly AppDbContext _context;
        private readonly BillingController _controller;

        public BillingControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);

            var store = new Mock<IUserStore<ApplicationUser>>();
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);
            _mockBillingService = new Mock<IBillingService>();

            _controller = new BillingController(_context, _mockUserManager.Object, _mockBillingService.Object);
        }

        private void SetupUser(string userId, string role)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role)
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
            
            var appUser = new ApplicationUser { Id = userId };
            _mockUserManager.Setup(x => x.GetUserId(It.IsAny<ClaimsPrincipal>())).Returns(userId);
            _mockUserManager.Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>())).ReturnsAsync(appUser);
            _mockUserManager.Setup(x => x.GetRolesAsync(appUser)).ReturnsAsync(new[] { role });
            _mockUserManager.Setup(x => x.IsInRoleAsync(appUser, role)).ReturnsAsync(true);
        }

        [Fact]
        public async Task GetBill_Owner_ReturnsBill()
        {
            // Arrange
            var userId = "cust-1";
            SetupUser(userId, "Customer");

            var bill = new Billing { BillingId = 1, ServiceRequest = new ServiceRequest { IssueDescription = "Test", Vehicle = new Vehicle { Customer = new Customer { UserId = userId }, Model = "M", RegistrationNumber = "R", VehicleType = "T" } } };
            _context.Billings.Add(bill);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetBill(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedBill = Assert.IsType<Billing>(okResult.Value);
            Assert.Equal(1, returnedBill.BillingId);
        }

        [Fact]
        public async Task GetBill_OtherCustomer_ReturnsForbid()
        {
            // Arrange
            var userId = "cust-1";
            SetupUser(userId, "Customer");

            // Bill belongs to "cust-2"
            var bill = new Billing { BillingId = 1, ServiceRequest = new ServiceRequest { IssueDescription = "Test", Vehicle = new Vehicle { Customer = new Customer { UserId = "cust-2" }, Model = "M", RegistrationNumber = "R", VehicleType = "T" } } };
            _context.Billings.Add(bill);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetBill(1);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task PayBill_Success_ReturnsOk()
        {
             // Arrange
            SetupUser("cust-1", "Customer");
            var billId = 1;
            _mockBillingService.Setup(x => x.ProcessPaymentAsync(billId)).ReturnsAsync(new Billing { BillingId = billId, PaymentStatus = "Paid" });

            // Act
            var result = await _controller.PayBill(billId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic val = okResult.Value;
            Assert.Equal("Payment Successful", (string)val.GetType().GetProperty("message").GetValue(val, null));
        }

        [Fact]
        public async Task PayBill_AlreadyPaid_ReturnsBadRequest() // Assuming Service throws exception
        {
            // Arrange
            SetupUser("cust-1", "Customer");
            var billId = 1;
            _mockBillingService.Setup(x => x.ProcessPaymentAsync(billId)).ThrowsAsync(new InvalidOperationException("Bill already paid"));

            // Act
            var result = await _controller.PayBill(billId);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Bill already paid", badRequest.Value);
        }
    }
}
