using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Repositories.Organization.Interfaces
{
    public interface ILocationRepository
        : IRepositoryBase<Location>
    {
        Task<Location?> GetByIdAsync(
            int locationId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Location>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<Location?> GetWithAddressAsync(
        int locationId,
        CancellationToken cancellationToken = default);

        Task<Address?> GetAddressAsync(
            int locationId,
            CancellationToken cancellationToken = default);

    }
}
