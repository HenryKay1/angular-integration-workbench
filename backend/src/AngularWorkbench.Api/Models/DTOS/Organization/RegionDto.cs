namespace AngularWorkbench.Api.Models.DTOS.Access
{
    public sealed class RegionDto
    {
        public int RegionId { get; set; }
        public required string Name { get; set; }
        public string? Code { get; set; }
        public bool IsActive { get; set; }
    }
}
