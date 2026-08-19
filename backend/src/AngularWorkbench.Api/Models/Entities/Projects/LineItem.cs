namespace AngularWorkbench.Api.Domain.Entities;

public sealed class LineItem
{
    public int LineItemId { get; set; }
    public int ScheduleId { get; set; }
    public int? ProductModelId { get; set; }
    public required string Tag { get; set; }
    public int Quantity { get; set; }
    public required string Status { get; set; }

    public Schedule Schedule { get; set; } = null!;
    public ProductModel? ProductModel { get; set; }
    public ICollection<LineItemSelection> Selections { get; set; } = new List<LineItemSelection>();
}
