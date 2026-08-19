using AngularWorkbench.Api.Domain.Entities;

namespace AngularWorkbench.Api.Services.Organization.Interfaces
{

    public interface ILocationService
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

        Task<Location> CreateAsync(
            Location location,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            Location location,
            CancellationToken cancellationToken = default);

        Task DeleteAsync(
            int locationId,
            CancellationToken cancellationToken = default);
    }
}
