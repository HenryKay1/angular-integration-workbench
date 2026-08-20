namespace AngularWorkbench.Api.Models.DTOS.Requests
{
    public sealed class LocationRequest
    {
        public int CompanyId { get; set; }
        public int RegionId { get; set; }
        public required string Name { get; set; }
        public string? Code { get; set; }
        public bool IsActive { get; set; } = true;
        public required AddressRequest Address { get; set; }

    }
}
