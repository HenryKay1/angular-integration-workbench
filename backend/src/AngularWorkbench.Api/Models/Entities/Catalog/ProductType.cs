namespace AngularWorkbench.Api.Domain.Entities;

public sealed class ProductType
{
    public int ProductTypeId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
