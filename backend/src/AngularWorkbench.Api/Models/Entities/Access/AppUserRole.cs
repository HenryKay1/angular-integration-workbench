namespace AngularWorkbench.Api.Domain.Entities;

public sealed class AppUserRole
{
    public int AppUserRoleId { get; set; }
    public int AppUserId { get; set; }
    public int RoleId { get; set; }
    public int AccessScopeLookupId { get; set; }
    public int? CompanyId { get; set; }
    public int? RegionId { get; set; }

    public AppUser AppUser { get; set; } = null!;
    public Role Role { get; set; } = null!;
    public Lookup AccessScope { get; set; } = null!;
    public Company? Company { get; set; }
    public Region? Region { get; set; }
}
