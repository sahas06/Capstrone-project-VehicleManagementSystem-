using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VechileManagementAPI.Controllers
{
    [ApiController]
    [Route("api/home")]
    public class HomeController : ControllerBase
    {
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public IActionResult Admin()
        {
            return Ok("Welcome Admin");
        }

        [HttpGet("manager")]
        [Authorize(Roles = "Manager")]
        public IActionResult Manager()
        {
            return Ok("Welcome Manager");
        }

        [HttpGet("technician")]
        [Authorize(Roles = "Technician")]
        public IActionResult Technician()
        {
            return Ok("Welcome Technician");
        }

        [HttpGet("customer")]
        [Authorize(Roles = "Customer")]
        public IActionResult Customer()
        {
            return Ok("Welcome Customer");
        }
    }
}
