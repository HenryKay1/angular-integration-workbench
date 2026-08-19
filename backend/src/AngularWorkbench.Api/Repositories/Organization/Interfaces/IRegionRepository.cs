using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Repositories.Organization.Interfaces
{
    public interface IRegionRepository
        : IRepositoryBase<Region>
    {
        Task<Region?> GetByIdAsync(
            int regionId,
            CancellationToken cancellationToken = default);

        Task<Region?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Region>> GetActiveAsync(
            CancellationToken cancellationToken = default);
    }
}
