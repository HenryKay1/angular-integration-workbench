namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Region
{
    public int RegionId { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Location> Locations { get; set; } = new List<Location>();
}
