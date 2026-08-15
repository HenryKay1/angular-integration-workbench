using AngularWorkbench.Api.Domain.Entities;

namespace AngularWorkbench.Api.Domain.Services;

public static class RoleAssignmentValidator
{
    public static bool CanAssignRole(AppUser user, Role role)
    {
        return role.CompanyScope is CompanyScope.Both
            || user.Company.IsInternal && role.CompanyScope is CompanyScope.Internal
            || !user.Company.IsInternal && role.CompanyScope is CompanyScope.External;
    }

    public static void ValidateCanAssignRole(AppUser user, Role role)
    {
        if (!CanAssignRole(user, role))
        {
            throw new InvalidOperationException($"Role '{role.Name}' cannot be assigned to user '{user.Email}' for this company type.");
        }
    }
}
