using AngularWorkbench.Api.Domain.Entities;

namespace AngularWorkbench.Api.Services.Organization.Interfaces
{
    public interface IRegionService
    {
        Task<Region?> GetByIdAsync(
            int regionId,
            CancellationToken cancellationToken = default);

        Task<Region?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Region>> GetActiveAsync(
            CancellationToken cancellationToken = default);

        Task<Region> CreateAsync(
            Region region,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            Region region,
            CancellationToken cancellationToken = default);

        Task DeactivateAsync(
            int regionId,
            CancellationToken cancellationToken = default);
    }
}
