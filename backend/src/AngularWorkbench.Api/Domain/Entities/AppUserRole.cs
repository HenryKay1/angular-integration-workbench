namespace AngularWorkbench.Api.Domain.Entities;

public sealed class AppUserRole
{
    public int AppUserId { get; set; }
    public int RoleId { get; set; }

    public AppUser AppUser { get; set; } = null!;
    public Role Role { get; set; } = null!;
}
