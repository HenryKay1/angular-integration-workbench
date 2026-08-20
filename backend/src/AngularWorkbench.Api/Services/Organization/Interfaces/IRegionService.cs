
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;

namespace AngularWorkbench.Api.Services.Organization.Interfaces
{
    public interface IRegionService
    {
        Task<RegionDto?> GetByIdAsync(
            int regionId,
            CancellationToken cancellationToken = default);

        Task<RegionDto?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<RegionDto>> GetActiveAsync(
            CancellationToken cancellationToken = default);

        Task<RegionDto> CreateAsync(
            RegionRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            int regionId,
            RegionRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeactivateAsync(
            int regionId,
            CancellationToken cancellationToken = default);
    }
}