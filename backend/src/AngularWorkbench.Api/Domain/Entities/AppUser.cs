namespace AngularWorkbench.Api.Domain.Entities;

public sealed class AppUser
{
    public int AppUserId { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedUtc { get; set; }
    public int CompanyId { get; set; }
    public int? LocationId { get; set; }

    public Company Company { get; set; } = null!;
    public Location? Location { get; set; }
    public ICollection<Project> CreatedProjects { get; set; } = new List<Project>();
    public ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
}
