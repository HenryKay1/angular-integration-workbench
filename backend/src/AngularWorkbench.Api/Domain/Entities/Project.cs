namespace AngularWorkbench.Api.Domain.Entities;

public sealed class Project
{
    public int ProjectId { get; set; }
    public required string Name { get; set; }
    public string? ProjectNumber { get; set; }
    public string? CustomerName { get; set; }
    public string? Location { get; set; }
    public required string Status { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime ModifiedUtc { get; set; }
    public int CreatedByUserId { get; set; }

    public AppUser CreatedByUser { get; set; } = null!;
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
