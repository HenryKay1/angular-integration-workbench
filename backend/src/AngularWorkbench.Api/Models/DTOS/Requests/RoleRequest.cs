namespace AngularWorkbench.Api.Models.DTOS.Requests
{
    public sealed class RoleRequest
    {
        public required string Name { get; set; }
        public string? Description { get; set; }

        public int CompanyScopeValue { get; set; }

        public bool HasAllPermissions { get; set; }
        public bool IsActive { get; set; } = true;

        public IReadOnlyList<int> PermissionIds { get; set; }
            = new List<int>();
    }
}
