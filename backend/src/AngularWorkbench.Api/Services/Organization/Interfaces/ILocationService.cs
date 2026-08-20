using AngularWorkbench.Api.Models.DTOS.Organization;
using AngularWorkbench.Api.Models.DTOS.Requests;

namespace AngularWorkbench.Api.Services.Organization.Interfaces
{
    public interface ILocationService
    {
        Task<LocationDto?> GetByIdAsync(
            int locationId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<LocationDto>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<LocationDetailsDto?> GetDetailsAsync(
            int locationId,
            CancellationToken cancellationToken = default);

        Task<LocationDto> CreateAsync(
            LocationRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            int locationId,
            LocationRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(
            int locationId,
            CancellationToken cancellationToken = default);
    }
}