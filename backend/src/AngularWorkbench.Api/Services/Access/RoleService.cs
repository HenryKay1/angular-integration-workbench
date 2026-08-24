using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Models.Entities.Reference.Enums;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Reference.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Services.Access.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace AngularWorkbench.Api.Services.Access
{
    public sealed class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IPermissionRepository _permissionRepository;
        private readonly ILookupRepository _lookupRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RoleService(
            IRoleRepository roleRepository,
            IPermissionRepository permissionRepository,
            ILookupRepository lookupRepository,
            IUnitOfWork unitOfWork)
        {
            _roleRepository = roleRepository;
            _permissionRepository = permissionRepository;
            _lookupRepository = lookupRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<RoleDto?> GetByIdAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Role, RoleDto>()
                    .Where(x => x.RoleId == roleId)
                    .Select(x => new RoleDto
                    {
                        RoleId = x.RoleId,
                        Name = x.Name,
                        Description = x.Description,
                        CompanyScopeValue = x.CompanyScope.Value,
                        CompanyScopeName = x.CompanyScope.Name,
                        HasAllPermissions = x.HasAllPermissions,
                        IsActive = x.IsActive
                    });

            return await _roleRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);
        }

        public async Task<RoleDetailsDto?> GetDetailsAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Role, RoleDetailsDto>()
                    .Where(x => x.RoleId == roleId)
                    .Select(x => new RoleDetailsDto
                    {
                        RoleId = x.RoleId,
                        Name = x.Name,
                        Description = x.Description,
                        CompanyScopeValue = x.CompanyScope.Value,
                        CompanyScopeName = x.CompanyScope.Name,
                        HasAllPermissions = x.HasAllPermissions,
                        IsActive = x.IsActive,

                        Permissions = x.RolePermissions
                            .Select(rolePermission => new PermissionDto
                            {
                                PermissionId =
                                    rolePermission.Permission.PermissionId,

                                Code =
                                    rolePermission.Permission.Code,

                                Name =
                                    rolePermission.Permission.Name,

                                Description =
                                    rolePermission.Permission.Description
                            })
                            .ToList()
                    });

            return await _roleRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);
        }

        public async Task<RoleDto?> GetByNameAsync(
            string name,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Role, RoleDto>()
                    .Where(x => x.Name == name)
                    .Select(x => new RoleDto
                    {
                        RoleId = x.RoleId,
                        Name = x.Name,
                        Description = x.Description,
                        CompanyScopeValue = x.CompanyScope.Value,
                        CompanyScopeName = x.CompanyScope.Name,
                        HasAllPermissions = x.HasAllPermissions,
                        IsActive = x.IsActive
                    });

            return await _roleRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);
        }

        public async Task<IReadOnlyList<RoleDto>> GetActiveAsync(
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Role, RoleDto>()
                    .Where(x => x.IsActive)
                    .Select(x => new RoleDto
                    {
                        RoleId = x.RoleId,
                        Name = x.Name,
                        Description = x.Description,
                        CompanyScopeValue = x.CompanyScope.Value,
                        CompanyScopeName = x.CompanyScope.Name,
                        HasAllPermissions = x.HasAllPermissions,
                        IsActive = x.IsActive
                    });

            return await _roleRepository.ListAsync(
                specification,
                cancellationToken);
        }

        public async Task<bool> RoleNameIsUniqueAsync(
            string name,
            int? roleId = null,
            CancellationToken cancellationToken = default)
        {
            var normalizedName = name.Trim().ToLowerInvariant();

            if (normalizedName.Length == 0)
            {
                return true;
            }

            var specification =
                new QuerySpecification<Role>()
                    .Where(role =>
                        role.Name.ToLower() == normalizedName &&
                        (!roleId.HasValue || role.RoleId != roleId.Value));

            var matchingRoles = await _roleRepository.CountAsync(
                specification,
                cancellationToken);

            return matchingRoles == 0;
        }

        public async Task<ValidationResultDto> ValidateRoleNameAsync(
            RoleNameValidationRequest request,
            CancellationToken cancellationToken = default)
        {
            var isUnique = await RoleNameIsUniqueAsync(
                request.Name,
                request.RoleId,
                cancellationToken);

            return new ValidationResultDto
            {
                IsValid = isUnique,
                Message = isUnique ? null : "Role name must be unique."
            };
        }

        public async Task<RoleDto> CreateAsync(
    RoleRequest request,
    CancellationToken cancellationToken = default)
        {
            var companyScope =
                await _lookupRepository.GetByValueAsync(
                    LookupCategoryEnum.CompanyScope,
                    request.CompanyScopeValue,
                    cancellationToken);

            if (companyScope is null)
            {
                throw new InvalidOperationException(
                    $"Company scope value {request.CompanyScopeValue} does not exist.");
            }

            var permissionIds =
                request.HasAllPermissions
                    ? Array.Empty<int>()
                    : await ValidatePermissionIdsAsync(
                        request.PermissionIds,
                        cancellationToken);

            var role = new Role
            {
                Name = request.Name,
                Description = request.Description,

                CompanyScopeLookupId =
                    companyScope.LookupId,

                HasAllPermissions =
                    request.HasAllPermissions,

                IsActive =
                    request.IsActive
            };

            foreach (var permissionId in permissionIds)
            {
                role.RolePermissions.Add(
                    new RolePermission
                    {
                        PermissionId = permissionId
                    });
            }

            await _roleRepository.AddAsync(
                role,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return new RoleDto
            {
                RoleId = role.RoleId,
                Name = role.Name,
                Description = role.Description,

                CompanyScopeValue =
                    companyScope.Value,

                CompanyScopeName =
                    companyScope.Name,

                HasAllPermissions =
                    role.HasAllPermissions,

                IsActive =
                    role.IsActive
            };
        }

        public async Task<bool> UpdateAsync(
    int roleId,
    RoleRequest request,
    CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Role>()
                    .Where(x => x.RoleId == roleId)
                    .Include(query =>
                        query.Include(x =>
                            x.RolePermissions))
                    .WithTracking();

            var role =
                await _roleRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (role is null)
            {
                return false;
            }

            var companyScope =
                await _lookupRepository.GetByValueAsync(
                    LookupCategoryEnum.CompanyScope,
                    request.CompanyScopeValue,
                    cancellationToken);

            if (companyScope is null)
            {
                throw new InvalidOperationException(
                    $"Company scope value {request.CompanyScopeValue} does not exist.");
            }

            var requestedPermissionIds =
                request.HasAllPermissions
                    ? Array.Empty<int>()
                    : await ValidatePermissionIdsAsync(
                        request.PermissionIds,
                        cancellationToken);

            role.Name = request.Name;
            role.Description = request.Description;

            role.CompanyScopeLookupId =
                companyScope.LookupId;

            role.HasAllPermissions =
                request.HasAllPermissions;

            role.IsActive =
                request.IsActive;

            SynchronizePermissions(
                role,
                requestedPermissionIds);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }
        private static void SynchronizePermissions(
            Role role,
            IReadOnlyCollection<int> requestedPermissionIds)
        {
            var requestedIds =
                requestedPermissionIds.ToHashSet();

            var rolePermissionsToRemove =
                role.RolePermissions
                    .Where(x =>
                        !requestedIds.Contains(
                            x.PermissionId))
                    .ToList();

            foreach (var rolePermission in rolePermissionsToRemove)
            {
                role.RolePermissions.Remove(
                    rolePermission);
            }

            var existingPermissionIds =
                role.RolePermissions
                    .Select(x => x.PermissionId)
                    .ToHashSet();

            var permissionIdsToAdd =
                requestedIds
                    .Except(existingPermissionIds);

            foreach (var permissionId in permissionIdsToAdd)
            {
                role.RolePermissions.Add(
                    new RolePermission
                    {
                        PermissionId = permissionId
                    });
            }
        }
        private async Task<int[]> ValidatePermissionIdsAsync(
            IEnumerable<int> permissionIds,
            CancellationToken cancellationToken)
        {
            var requestedIds =
                permissionIds
                    .Distinct()
                    .ToArray();

            if (requestedIds.Length == 0)
            {
                return requestedIds;
            }

            var specification =
                new QueryProjectionSpecification<Permission, int>()
                    .Where(x =>
                        requestedIds.Contains(
                            x.PermissionId))
                    .Select(x =>
                        x.PermissionId);

            var existingIds =
                await _permissionRepository.ListAsync(
                    specification,
                    cancellationToken);

            if (existingIds.Count != requestedIds.Length)
            {
                throw new InvalidOperationException(
                    "One or more selected permissions do not exist.");
            }

            return requestedIds;
        }

        public async Task<bool> DeactivateAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Role>()
                    .Where(x => x.RoleId == roleId)
                    .WithTracking();

            var role =
                await _roleRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (role is null)
            {
                return false;
            }

            role.IsActive = false;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }
    }
}
    
