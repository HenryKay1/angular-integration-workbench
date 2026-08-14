namespace AngularWorkbench.Api.Domain.Entities;

public sealed class ProductModel
{
    public int ProductModelId { get; set; }
    public int ProductId { get; set; }
    public required string ModelNumber { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public Product Product { get; set; } = null!;
    public ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
}
