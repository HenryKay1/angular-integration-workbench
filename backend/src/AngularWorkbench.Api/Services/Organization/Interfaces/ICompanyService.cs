using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Organization;
using AngularWorkbench.Api.Models.DTOS.Requests;

namespace AngularWorkbench.Api.Services.Organization.Interfaces
{

    public interface ICompanyService
    {
        Task<CompanyDto?> GetByIdAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<CompanyDetailsDto?> GetCompanyDetailsAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<CompanyDto> CreateAsync(
            CompanyRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            int companyId,
            CompanyRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(
            int companyId,
            CancellationToken cancellationToken = default);
    }
}
