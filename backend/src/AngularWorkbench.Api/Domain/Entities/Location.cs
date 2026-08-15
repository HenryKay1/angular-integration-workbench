namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Location
{
    public int LocationId { get; set; }
    public int CompanyId { get; set; }
    public int RegionId { get; set; }
    public int AddressId { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public bool IsActive { get; set; } = true;

    public Company Company { get; set; } = null!;
    public Region Region { get; set; } = null!;
    public Address Address { get; set; } = null!;
    public ICollection<AppUser> AppUsers { get; set; } = new List<AppUser>();
}
