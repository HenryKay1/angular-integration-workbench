using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.DataView;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Services.Access.Interfaces;
using AngularWorkbench.Api.Services.Organization.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AngularWorkbench.Api.Controllers.Access
{
    [ApiController]
    [Route("api/access")]
    public sealed class AccessController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly IPermissionService _permissionService;

        public AccessController(
            IRoleService roleService,
            IPermissionService permissionService)
        {
            _roleService = roleService;
            _permissionService = permissionService;
        }

        // =========================================================
        // Roles
        // =========================================================

        [HttpGet("roles")]
        public async Task<ActionResult<IReadOnlyList<RoleDto>>> GetRolesAsync(
            CancellationToken cancellationToken)
        {
            var roles = await _roleService.GetActiveAsync(
                cancellationToken);

            return Ok(roles);
        }

        [HttpPost("roles/dataview")]
        public async Task<ActionResult<DataViewResultDto<RoleDto>>> GetRolesDataViewAsync(DataViewRequestDto request,CancellationToken cancellationToken)
        {
            var roles = await _roleService.GetRolesDataViewAsync(
                request,
                cancellationToken);

            return Ok(roles);
        }

        [HttpGet("roles/{roleId:int}")]
        public async Task<ActionResult<RoleDto>> GetRoleByIdAsync(
            int roleId,
            CancellationToken cancellationToken)
        {
            var role = await _roleService.GetByIdAsync(
                roleId,
                cancellationToken);

            if (role is null)
            {
                return NotFound();
            }

            return Ok(role);
        }

        [HttpGet("roles/{roleId:int}/details")]
        public async Task<ActionResult<RoleDetailsDto>> GetRoleDetailsAsync(
            int roleId,
            CancellationToken cancellationToken)
        {
            var role = await _roleService.GetDetailsAsync(
                roleId,
                cancellationToken);

            if (role is null)
            {
                return NotFound();
            }

            return Ok(role);
        }

        [HttpGet("roles/name/{name}")]
        public async Task<ActionResult<RoleDto>> GetRoleByNameAsync(
            string name,
            CancellationToken cancellationToken)
        {
            var role = await _roleService.GetByNameAsync(
                name,
                cancellationToken);

            if (role is null)
            {
                return NotFound();
            }

            return Ok(role);
        }

        [HttpPost("roles")]
        public async Task<ActionResult<RoleDto>> CreateRoleAsync(
            RoleRequest request,
            CancellationToken cancellationToken)
        {
            var role = await _roleService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                "GetRoleById",
                new { roleId = role.RoleId },
                role);
        }

        [HttpPost("roles/validate-name")]
        public async Task<ActionResult<ValidationResultDto>> ValidateRoleNameAsync(
            RoleNameValidationRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _roleService.ValidateRoleNameAsync(
                request,
                cancellationToken);

            return Ok(result);
        }

        [HttpPut("roles/{roleId:int}")]
        public async Task<IActionResult> UpdateRoleAsync(
            int roleId,
            RoleRequest request,
            CancellationToken cancellationToken)
        {
            var updated = await _roleService.UpdateAsync(
                roleId,
                request,
                cancellationToken);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("roles/{roleId:int}")]
        public async Task<IActionResult> DeactivateRoleAsync(
            int roleId,
            CancellationToken cancellationToken)
        {
            var deactivated = await _roleService.DeactivateAsync(
                roleId,
                cancellationToken);

            if (!deactivated)
            {
                return NotFound();
            }

            return NoContent();
        }

        // =========================================================
        // Permissions
        // =========================================================

        [HttpGet("permissions")]
        public async Task<ActionResult<IReadOnlyList<PermissionDto>>> GetPermissionsAsync(
            CancellationToken cancellationToken)
        {
            var permissions = await _permissionService.GetAllAsync(
                cancellationToken);

            return Ok(permissions);
        }

        [HttpGet("permissions/{permissionId:int}")]
        public async Task<ActionResult<PermissionDto>> GetPermissionByIdAsync(
            int permissionId,
            CancellationToken cancellationToken)
        {
            var permission = await _permissionService.GetByIdAsync(
                permissionId,
                cancellationToken);

            if (permission is null)
            {
                return NotFound();
            }

            return Ok(permission);
        }

        [HttpGet("permissions/code/{code}")]
        public async Task<ActionResult<PermissionDto>> GetPermissionByCodeAsync(
            string code,
            CancellationToken cancellationToken)
        {
            var permission = await _permissionService.GetByCodeAsync(
                code,
                cancellationToken);

            if (permission is null)
            {
                return NotFound();
            }

            return Ok(permission);
        }

        [HttpPost("permissions")]
        public async Task<ActionResult<PermissionDto>> CreatePermissionAsync(
            PermissionRequest request,
            CancellationToken cancellationToken)
        {
            var permission = await _permissionService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetPermissionByIdAsync),
                new { permissionId = permission.PermissionId },
                permission);
        }

        [HttpPut("permissions/{permissionId:int}")]
        public async Task<IActionResult> UpdatePermissionAsync(
            int permissionId,
            PermissionRequest request,
            CancellationToken cancellationToken)
        {
            var updated = await _permissionService.UpdateAsync(
                permissionId,
                request,
                cancellationToken);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
