namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Company
{
    public int CompanyId { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public bool IsInternal { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Location> Locations { get; set; } = new List<Location>();
    public ICollection<AppUser> AppUsers { get; set; } = new List<AppUser>();
}
