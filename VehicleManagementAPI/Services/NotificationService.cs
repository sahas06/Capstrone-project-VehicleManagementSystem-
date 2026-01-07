using Microsoft.EntityFrameworkCore;
using VechileManagementAPI.Data;
using VechileManagementAPI.Models;

namespace VechileManagementAPI.Services
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(string userId, string message);
        Task<List<Notification>> GetUserNotificationsAsync(string userId);

        Task<int> GetUnreadCountAsync(string userId);
        Task MarkAsReadAsync(int notificationId, string userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateNotificationAsync(string userId, string message)
        {
            var notification = new Notification
            {
                UserId = userId,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.Now
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task MarkAsReadAsync(int notificationId, string userId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            
            if (notification == null) return; // Or throw NotFound

            // SECURITY: Prevent reading others' notifications
            if (notification.UserId != userId)
            {
                throw new UnauthorizedAccessException("You cannot access this notification.");
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }
        
        // Fix for Interface typo above (TaskMarkAsReadAsync vs MarkAsReadAsync) - Removing duplicate
        // Actually, I made a typo in the interface definition inside the string block. I will fix it in the file.

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();
        }
    }
}
