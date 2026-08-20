namespace AngularWorkbench.Api.Models.DTOS.Access
{
    public sealed class AppUserDetailsDto
    {
        public int AppUserId { get; set; }

        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedUtc { get; set; }

        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }

        public int? LocationId { get; set; }
        public string? LocationName { get; set; }

        public IReadOnlyList<AppUserRoleDto> Roles { get; set; }
            = new List<AppUserRoleDto>();
    }
}
