using Microsoft.EntityFrameworkCore;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Services.Organization.Interfaces;

namespace AngularWorkbench.Api.Services.Organization
{
    public sealed class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _companyRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CompanyService(
            ICompanyRepository companyRepository,
            IUnitOfWork unitOfWork)
        {
            _companyRepository = companyRepository;
            _unitOfWork = unitOfWork;

        }


        public async Task<Company> CreateAsync(
            Company company,
            CancellationToken cancellationToken = default)
        {
            await _companyRepository.AddAsync(
                company,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return company;
        }

        public async Task UpdateAsync(
            Company company,
            CancellationToken cancellationToken = default)
        {
            _companyRepository.Update(company);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }

        public async Task DeleteAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Company>()
                    .Where(x =>
                        x.CompanyId == companyId)
                    .WithTracking();

            var company =
                await _companyRepository
                    .FirstOrDefaultAsync(
                        specification,
                        cancellationToken);

            if (company is null)
            {
                return;
            }
            _companyRepository.Delete(company);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }


        public async Task<Company?> GetByIdAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Company>()
                    .Where(x =>
                        x.CompanyId == companyId);

            return await _companyRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<Company?> GetWithLocationsAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Company>()
                    .Where(x =>
                        x.CompanyId == companyId)
                    .Include(query =>
                        query.Include(x =>
                            x.Locations));

            return await _companyRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<Company?> GetWithOrganizationDataAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Company>()
                    .Where(x =>
                        x.CompanyId == companyId &&
                        x.IsActive &&
                        x.Locations.Any() &&
                        x.AppUsers.Any())
                    .Include(query =>
                        query.Include(x =>
                            x.Locations))
                    .Include(query =>
                        query.Include(x =>
                            x.AppUsers))
                    .SplitQuery();

            return await _companyRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

    }
}
