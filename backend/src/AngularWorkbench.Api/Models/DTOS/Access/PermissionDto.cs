namespace AngularWorkbench.Api.Models.DTOS.Access
{
    public sealed class PermissionDto
    {
        public int PermissionId { get; set; }

        public required string Code { get; set; }
        public required string Name { get; set; }

        public string? Description { get; set; }
    }
}
