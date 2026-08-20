namespace AngularWorkbench.Api.Models.DTOS.Requests
{
    public sealed class AppUserRoleRequest
    {
        public int AppUserId { get; set; }

        public int RoleId { get; set; }

        public int AccessScopeValue { get; set; }

        public int? CompanyId { get; set; }

        public int? RegionId { get; set; }
    }
}
