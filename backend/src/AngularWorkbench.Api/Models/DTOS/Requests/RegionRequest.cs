namespace AngularWorkbench.Api.Models.DTOS.Requests
{
    public sealed class RegionRequest
    {
        public required string Name { get; set; }
        public string? Code { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
