using AngularWorkbench.Api.Domain.Entities;

namespace AngularWorkbench.Api.Domain.Services;

public static class RoleAssignmentValidator
{
    private const string InternalCompanyScope = "INTERNAL";
    private const string ExternalCompanyScope = "EXTERNAL";
    private const string BothCompanyScope = "BOTH";
    private const string GlobalAccessScope = "GLOBAL";
    private const string CompanyAccessScope = "COMPANY";
    private const string RegionAccessScope = "REGION";
    private const string AccessScopeCategory = "ACCESS_SCOPE";

    public static bool CanAssignRole(AppUser user, Role role)
    {
        return role.CompanyScope.Code is BothCompanyScope
            || user.Company.IsInternal && role.CompanyScope.Code is InternalCompanyScope
            || !user.Company.IsInternal && role.CompanyScope.Code is ExternalCompanyScope;
    }

    public static void ValidateCanAssignRole(AppUser user, Role role)
    {
        if (!CanAssignRole(user, role))
        {
            throw new InvalidOperationException($"Role '{role.Name}' cannot be assigned to user '{user.Email}' for this company type.");
        }
    }

    public static void ValidateAccessScope(AppUserRole userRole)
    {
        if (userRole.AccessScope.LookupCategory.Code != AccessScopeCategory)
        {
            throw new InvalidOperationException($"Lookup '{userRole.AccessScope.Code}' is not an access scope.");
        }

        var isValid = userRole.AccessScope.Code switch
        {
            GlobalAccessScope => userRole.CompanyId is null && userRole.RegionId is null,
            CompanyAccessScope => userRole.CompanyId is not null && userRole.RegionId is null,
            RegionAccessScope => userRole.RegionId is not null && userRole.CompanyId is null,
            _ => false
        };

        if (!isValid)
        {
            throw new InvalidOperationException($"Access scope '{userRole.AccessScope.Code}' has an invalid target.");
        }
    }
}
