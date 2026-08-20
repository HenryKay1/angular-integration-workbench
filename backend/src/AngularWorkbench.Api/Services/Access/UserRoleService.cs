using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Models.Entities.Reference.Enums;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Reference.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Services.Access.Interfaces;

namespace AngularWorkbench.Api.Services.Access;

public sealed class UserRoleService : IUserRoleService
{
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly ILookupRepository _lookupRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserRoleService(
        IUserRoleRepository userRoleRepository,
        ILookupRepository lookupRepository,
        IUnitOfWork unitOfWork)
    {
        _userRoleRepository = userRoleRepository;
        _lookupRepository = lookupRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AppUserRoleDto?> GetByIdAsync(
        int appUserRoleId,
        CancellationToken cancellationToken = default)
    {
        var specification =
            new QueryProjectionSpecification<AppUserRole, AppUserRoleDto>()
                .Where(x => x.AppUserRoleId == appUserRoleId)
                .Select(x => new AppUserRoleDto
                {
                    AppUserRoleId = x.AppUserRoleId,
                    AppUserId = x.AppUserId,

                    RoleId = x.RoleId,
                    RoleName = x.Role.Name,

                    AccessScopeValue = x.AccessScope.Value,
                    AccessScopeName = x.AccessScope.Name,

                    CompanyId = x.CompanyId,
                    CompanyName = x.Company != null
                        ? x.Company.Name
                        : null,

                    RegionId = x.RegionId,
                    RegionName = x.Region != null
                        ? x.Region.Name
                        : null
                });

        return await _userRoleRepository.FirstOrDefaultAsync(
            specification,
            cancellationToken);
    }

    public async Task<IReadOnlyList<AppUserRoleDto>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var specification =
            new QueryProjectionSpecification<AppUserRole, AppUserRoleDto>()
                .Where(x => x.AppUserId == userId)
                .Select(x => new AppUserRoleDto
                {
                    AppUserRoleId = x.AppUserRoleId,
                    AppUserId = x.AppUserId,

                    RoleId = x.RoleId,
                    RoleName = x.Role.Name,

                    AccessScopeValue = x.AccessScope.Value,
                    AccessScopeName = x.AccessScope.Name,

                    CompanyId = x.CompanyId,
                    CompanyName = x.Company != null
                        ? x.Company.Name
                        : null,

                    RegionId = x.RegionId,
                    RegionName = x.Region != null
                        ? x.Region.Name
                        : null
                });

        return await _userRoleRepository.ListAsync(
            specification,
            cancellationToken);
    }

    public async Task<IReadOnlyList<AppUserRoleDto>> GetByRoleIdAsync(
        int roleId,
        CancellationToken cancellationToken = default)
    {
        var specification =
            new QueryProjectionSpecification<AppUserRole, AppUserRoleDto>()
                .Where(x => x.RoleId == roleId)
                .Select(x => new AppUserRoleDto
                {
                    AppUserRoleId = x.AppUserRoleId,
                    AppUserId = x.AppUserId,

                    RoleId = x.RoleId,
                    RoleName = x.Role.Name,

                    AccessScopeValue = x.AccessScope.Value,
                    AccessScopeName = x.AccessScope.Name,

                    CompanyId = x.CompanyId,
                    CompanyName = x.Company != null
                        ? x.Company.Name
                        : null,

                    RegionId = x.RegionId,
                    RegionName = x.Region != null
                        ? x.Region.Name
                        : null
                });

        return await _userRoleRepository.ListAsync(
            specification,
            cancellationToken);
    }
    public async Task<AppUserRoleDto> AssignAsync(
    AppUserRoleRequest request,
    CancellationToken cancellationToken = default)
    {
        var accessScope =
            await _lookupRepository.GetByValueAsync(
                LookupCategoryEnum.AccessScope,
                request.AccessScopeValue,
                cancellationToken);

        if (accessScope is null)
        {
            throw new InvalidOperationException(
                $"Access scope value {request.AccessScopeValue} does not exist.");
        }

        ValidateScope(
            request.AccessScopeValue,
            request.CompanyId,
            request.RegionId);

        var userRole = new AppUserRole
        {
            AppUserId = request.AppUserId,
            RoleId = request.RoleId,

            AccessScopeLookupId =
                accessScope.LookupId,

            CompanyId = request.CompanyId,
            RegionId = request.RegionId
        };

        await _userRoleRepository.AddAsync(
            userRole,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        return new AppUserRoleDto
        {
            AppUserRoleId = userRole.AppUserRoleId,
            AppUserId = userRole.AppUserId,

            RoleId = userRole.RoleId,

            AccessScopeValue = accessScope.Value,
            AccessScopeName = accessScope.Name,

            CompanyId = userRole.CompanyId,
            RegionId = userRole.RegionId
        };
    }
    public async Task<bool> UpdateAsync(
    int appUserRoleId,
    AppUserRoleRequest request,
    CancellationToken cancellationToken = default)
    {
        var specification =
            new QuerySpecification<AppUserRole>()
                .Where(x =>
                    x.AppUserRoleId == appUserRoleId)
                .WithTracking();

        var userRole =
            await _userRoleRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);

        if (userRole is null)
        {
            return false;
        }

        var accessScope =
            await _lookupRepository.GetByValueAsync(
                LookupCategoryEnum.AccessScope,
                request.AccessScopeValue,
                cancellationToken);

        if (accessScope is null)
        {
            throw new InvalidOperationException(
                $"Access scope value {request.AccessScopeValue} does not exist.");
        }

        ValidateScope(
            request.AccessScopeValue,
            request.CompanyId,
            request.RegionId);

        userRole.AppUserId = request.AppUserId;
        userRole.RoleId = request.RoleId;

        userRole.AccessScopeLookupId =
            accessScope.LookupId;

        userRole.CompanyId = request.CompanyId;
        userRole.RegionId = request.RegionId;

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        return true;
    }
    public async Task<bool> RemoveAsync(
        int appUserRoleId,
        CancellationToken cancellationToken = default)
    {
        var specification =
            new QuerySpecification<AppUserRole>()
                .Where(x =>
                    x.AppUserRoleId == appUserRoleId)
                .WithTracking();

        var userRole =
            await _userRoleRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);

        if (userRole is null)
        {
            return false;
        }

        _userRoleRepository.Delete(userRole);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        return true;
    }
    private static void ValidateScope(
        int accessScopeValue,
        int? companyId,
        int? regionId)
    {
        var accessScope =
            (AccessScope)accessScopeValue;

        switch (accessScope)
        {
            case AccessScope.Global:

                if (companyId.HasValue || regionId.HasValue)
                {
                    throw new InvalidOperationException(
                        "Global access cannot specify a company or region.");
                }

                break;

            case AccessScope.Company:

                if (!companyId.HasValue)
                {
                    throw new InvalidOperationException(
                        "Company access requires a CompanyId.");
                }

                if (regionId.HasValue)
                {
                    throw new InvalidOperationException(
                        "Company access cannot specify a RegionId.");
                }

                break;

            case AccessScope.Region:

                if (!regionId.HasValue)
                {
                    throw new InvalidOperationException(
                        "Region access requires a RegionId.");
                }

                break;

            default:
                throw new InvalidOperationException(
                    $"Unsupported access scope value {accessScopeValue}.");
        }
    }
}
