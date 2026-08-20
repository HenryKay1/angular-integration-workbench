namespace AngularWorkbench.Api.Models.DTOS.Requests
{
    public sealed class PermissionRequest
    {
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
    }
}
