namespace AngularWorkbench.Api.Models.DTOS.Access
{
	public sealed class AppUserRoleDto
	{
		public int AppUserRoleId { get; set; }
		public int AppUserId { get; set; }

		public int RoleId { get; set; }
		public string? RoleName { get; set; }

		public int AccessScopeValue { get; set; }
		public string? AccessScopeName { get; set; }

		public int? CompanyId { get; set; }
		public string? CompanyName { get; set; }

		public int? RegionId { get; set; }
		public string? RegionName { get; set; }
	}
}
