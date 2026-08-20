namespace AngularWorkbench.Api.Models.DTOS.Access
{
    public sealed class RoleDto
    {
        public int RoleId { get; set; }

        public required string Name { get; set; }
        public string? Description { get; set; }

        public int CompanyScopeValue { get; set; }
        public string? CompanyScopeName { get; set; }

        public bool HasAllPermissions { get; set; }
        public bool IsActive { get; set; }
    }
}
