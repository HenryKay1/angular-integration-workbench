namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Product
{
    public int ProductId { get; set; }
    public int ProductTypeId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ProductType ProductType { get; set; } = null!;
    public ICollection<ProductModel> ProductModels { get; set; } = new List<ProductModel>();
    public ICollection<ProductOptionGroup> OptionGroups { get; set; } = new List<ProductOptionGroup>();
}
