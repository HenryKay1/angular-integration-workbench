namespace AngularWorkbench.Api.Models.DTOS.Access
{
    public sealed class AppUserDto
    {
        public int AppUserId { get; set; }

        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedUtc { get; set; }

        public int CompanyId { get; set; }
        public int? LocationId { get; set; }
    }
}
