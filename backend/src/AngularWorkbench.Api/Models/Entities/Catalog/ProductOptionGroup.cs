namespace AngularWorkbench.Api.Domain.Entities;

public sealed class ProductOptionGroup
{
    public int ProductOptionGroupId { get; set; }
    public int ProductId { get; set; }
    public required string Name { get; set; }
    public int SortOrder { get; set; }

    public Product Product { get; set; } = null!;
    public ICollection<ProductOption> Options { get; set; } = new List<ProductOption>();
}
