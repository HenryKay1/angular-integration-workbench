using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Organization;

namespace AngularWorkbench.Api.Models.DTOS.Organization
{
    public sealed class CompanyDetailsDto
    {
        public int CompanyId { get; set; }

        public required string Name { get; set; }

        public string? Code { get; set; }

        public bool IsInternal { get; set; }

        public bool IsActive { get; set; }

        public IReadOnlyList<LocationDto> Locations { get; set; }
            = new List<LocationDto>();
    }
}
