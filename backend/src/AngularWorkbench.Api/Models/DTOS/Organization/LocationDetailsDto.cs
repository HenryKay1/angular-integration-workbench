using AngularWorkbench.Api.Models.DTOS.Access;

namespace AngularWorkbench.Api.Models.DTOS.Organization
{
    public sealed class LocationDetailsDto
    {
        public int LocationId { get; set; }
        public int CompanyId { get; set; }

        public required string Name { get; set; }
        public string? Code { get; set; }
        public bool IsActive { get; set; }

        public RegionDto? Region { get; set; }
        public AddressDto? Address { get; set; }
    }
}
