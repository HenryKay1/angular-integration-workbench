namespace AngularWorkbench.Api.Models.DTOS.Organization
{
    public sealed class LocationDto
    {
        public int LocationId { get; set; }
        public int CompanyId { get; set; }
        public int RegionId { get; set; }
        public int AddressId { get; set; }

        public required string Name { get; set; }
        public string? Code { get; set; }
        public bool IsActive { get; set; }
    }
}
