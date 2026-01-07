using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using VechileManagementAPI.Services;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize] // 1. Secure API
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationController(INotificationService notificationService, UserManager<ApplicationUser> userManager)
        {
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var user = await _userManager.GetUserAsync(User);
            // 2. Filter by UserId Always
            var notifications = await _notificationService.GetUserNotificationsAsync(user.Id);
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
             var user = await _userManager.GetUserAsync(User);
             var count = await _notificationService.GetUnreadCountAsync(user.Id);
             return Ok(new { count });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                // 4. Prevent Read Hijacking (logic inside service)
                await _notificationService.MarkAsReadAsync(id, user.Id);
                return Ok(new { message = "Marked as read" });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception)
            {
                return NotFound();
            }
        }
    }
}
