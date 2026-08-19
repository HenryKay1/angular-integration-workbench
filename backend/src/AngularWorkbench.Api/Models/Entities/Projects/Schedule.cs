namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Schedule
{
    public int ScheduleId { get; set; }
    public int ProjectId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int SortOrder { get; set; }

    public Project Project { get; set; } = null!;
    public ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
}
