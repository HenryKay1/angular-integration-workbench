using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Services.Access.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AngularWorkbench.Api.Controllers.Access
{
    [ApiController]
    [Route("api/users")]
    public sealed class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IUserRoleService _userRoleService;

        public UsersController(
            IUserService userService,
            IUserRoleService userRoleService)
        {
            _userService = userService;
            _userRoleService = userRoleService;
        }

        // =========================================================
        // Users
        // =========================================================

        [HttpGet("{userId:int}")]
        public async Task<ActionResult<AppUserDto>> GetByIdAsync(
            int userId,
            CancellationToken cancellationToken)
        {
            var user = await _userService.GetByIdAsync(
                userId,
                cancellationToken);

            if (user is null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpGet("{userId:int}/details")]
        public async Task<ActionResult<AppUserDetailsDto>> GetDetailsAsync(
            int userId,
            CancellationToken cancellationToken)
        {
            var user = await _userService.GetDetailsAsync(
                userId,
                cancellationToken);

            if (user is null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<AppUserDto>> GetByEmailAsync(
            string email,
            CancellationToken cancellationToken)
        {
            var user = await _userService.GetByEmailAsync(
                email,
                cancellationToken);

            if (user is null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpGet("company/{companyId:int}")]
        public async Task<ActionResult<IReadOnlyList<AppUserDto>>> GetByCompanyAsync(
            int companyId,
            CancellationToken cancellationToken)
        {
            var users = await _userService.GetByCompanyIdAsync(
                companyId,
                cancellationToken);

            return Ok(users);
        }

        [HttpGet("location/{locationId:int}")]
        public async Task<ActionResult<IReadOnlyList<AppUserDto>>> GetByLocationAsync(
            int locationId,
            CancellationToken cancellationToken)
        {
            var users = await _userService.GetByLocationIdAsync(
                locationId,
                cancellationToken);

            return Ok(users);
        }

        [HttpPost]
        public async Task<ActionResult<AppUserDto>> CreateAsync(
            AppUserRequest request,
            CancellationToken cancellationToken)
        {
            var user = await _userService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetByIdAsync),
                new { userId = user.AppUserId },
                user);
        }

        [HttpPut("{userId:int}")]
        public async Task<IActionResult> UpdateAsync(
            int userId,
            AppUserRequest request,
            CancellationToken cancellationToken)
        {
            var updated = await _userService.UpdateAsync(
                userId,
                request,
                cancellationToken);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{userId:int}")]
        public async Task<IActionResult> DeactivateAsync(
            int userId,
            CancellationToken cancellationToken)
        {
            var deactivated = await _userService.DeactivateAsync(
                userId,
                cancellationToken);

            if (!deactivated)
            {
                return NotFound();
            }

            return NoContent();
        }

        // =========================================================
        // User Roles
        // =========================================================

        [HttpGet("{userId:int}/roles")]
        public async Task<ActionResult<IReadOnlyList<AppUserRoleDto>>> GetRolesAsync(
            int userId,
            CancellationToken cancellationToken)
        {
            var roles = await _userRoleService.GetByUserIdAsync(
                userId,
                cancellationToken);

            return Ok(roles);
        }

        [HttpGet("roles/{appUserRoleId:int}")]
        public async Task<ActionResult<AppUserRoleDto>> GetUserRoleByIdAsync(
            int appUserRoleId,
            CancellationToken cancellationToken)
        {
            var userRole = await _userRoleService.GetByIdAsync(
                appUserRoleId,
                cancellationToken);

            if (userRole is null)
            {
                return NotFound();
            }

            return Ok(userRole);
        }

        [HttpGet("roles/by-role/{roleId:int}")]
        public async Task<ActionResult<IReadOnlyList<AppUserRoleDto>>> GetUsersByRoleAsync(
            int roleId,
            CancellationToken cancellationToken)
        {
            var userRoles = await _userRoleService.GetByRoleIdAsync(
                roleId,
                cancellationToken);

            return Ok(userRoles);
        }

        [HttpPost("roles")]
        public async Task<ActionResult<AppUserRoleDto>> AssignRoleAsync(
            AppUserRoleRequest request,
            CancellationToken cancellationToken)
        {
            var userRole = await _userRoleService.AssignAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetUserRoleByIdAsync),
                new
                {
                    appUserRoleId = userRole.AppUserRoleId
                },
                userRole);
        }

        [HttpPut("roles/{appUserRoleId:int}")]
        public async Task<IActionResult> UpdateRoleAssignmentAsync(
            int appUserRoleId,
            AppUserRoleRequest request,
            CancellationToken cancellationToken)
        {
            var updated = await _userRoleService.UpdateAsync(
                appUserRoleId,
                request,
                cancellationToken);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("roles/{appUserRoleId:int}")]
        public async Task<IActionResult> RemoveRoleAsync(
            int appUserRoleId,
            CancellationToken cancellationToken)
        {
            var removed = await _userRoleService.RemoveAsync(
                appUserRoleId,
                cancellationToken);

            if (!removed)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}