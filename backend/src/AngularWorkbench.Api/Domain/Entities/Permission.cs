namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Permission
{
    public int PermissionId { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
