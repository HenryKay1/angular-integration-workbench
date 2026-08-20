namespace AngularWorkbench.Api.Models.DTOS.Requests
{
    public sealed class AppUserRequest
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }

        public int CompanyId { get; set; }
        public int? LocationId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
