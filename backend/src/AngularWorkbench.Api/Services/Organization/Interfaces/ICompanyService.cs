using AngularWorkbench.Api.Domain.Entities;

namespace AngularWorkbench.Api.Services.Organization.Interfaces
{

    public interface ICompanyService
    {
        Task<Company?> GetByIdAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<Company?> GetWithLocationsAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<Company?> GetWithOrganizationDataAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<Company> CreateAsync(
            Company company,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            Company company,
            CancellationToken cancellationToken = default);

        Task DeleteAsync(
            int companyId,
            CancellationToken cancellationToken = default);
    }
}
