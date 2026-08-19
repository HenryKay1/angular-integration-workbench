namespace AngularWorkbench.Api.Domain.Entities;

public sealed class LookupCategory
{
    public int LookupCategoryId { get; set; }
    public required string Name { get; set; }
    public required string Code { get; set; }
    public required int Value { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Lookup> Lookups { get; set; } = new List<Lookup>();
}
