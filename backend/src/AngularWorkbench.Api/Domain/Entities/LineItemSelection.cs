namespace AngularWorkbench.Api.Domain.Entities;

public sealed class LineItemSelection
{
    public int LineItemSelectionId { get; set; }
    public int LineItemId { get; set; }
    public int ProductOptionId { get; set; }
    public DateTime SelectedUtc { get; set; }

    public LineItem LineItem { get; set; } = null!;
    public ProductOption ProductOption { get; set; } = null!;
}
