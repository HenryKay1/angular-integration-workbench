namespace AngularWorkbench.Api.Domain.Entities;

public sealed class ProductOption
{
    public int ProductOptionId { get; set; }
    public int ProductOptionGroupId { get; set; }
    public required string Name { get; set; }
    public string? Value { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ProductOptionGroup ProductOptionGroup { get; set; } = null!;
    public ICollection<LineItemSelection> LineItemSelections { get; set; } = new List<LineItemSelection>();
}
