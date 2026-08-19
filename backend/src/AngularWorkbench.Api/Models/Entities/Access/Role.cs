namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Role
{
    public int RoleId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int CompanyScopeLookupId { get; set; }
    public bool HasAllPermissions { get; set; }
    public bool IsActive { get; set; } = true;

    public Lookup CompanyScope { get; set; } = null!;
    public ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
