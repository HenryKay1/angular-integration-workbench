using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Organization;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Services.Organization.Interfaces;
using Microsoft.EntityFrameworkCore;

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

        public async Task<CompanyDto?> GetByIdAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                 new QueryProjectionSpecification<Company, CompanyDto>()
                .Where(x => x.CompanyId == companyId)
                .Select(x => new CompanyDto
                {
                    CompanyId = x.CompanyId,
                    Name = x.Name,
                    Code = x.Code,
                    IsInternal = x.IsInternal,
                    IsActive = x.IsActive
                });

            return await _companyRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<CompanyDetailsDto?> GetCompanyDetailsAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Company, CompanyDetailsDto>()
                    .Where(x => x.CompanyId == companyId)
                    .Select(x => new CompanyDetailsDto
                    {
                        CompanyId = x.CompanyId,
                        Name = x.Name,
                        Code = x.Code,
                        IsInternal = x.IsInternal,
                        IsActive = x.IsActive,

                        Locations = x.Locations
                            .Select(location => new LocationDto
                            {
                                LocationId = location.LocationId,
                                CompanyId = location.CompanyId,
                                RegionId = location.RegionId,
                                AddressId = location.AddressId,
                                Name = location.Name,
                                Code = location.Code,
                                IsActive = location.IsActive
                            })
                            .ToList()
                    });

            return await _companyRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<CompanyDto> CreateAsync(
            CompanyRequest request,
            CancellationToken cancellationToken = default)
        {
            var company = new Company
            {
                Name = request.Name,
                Code = request.Code,
                IsInternal = request.IsInternal,
                IsActive = request.IsActive
            };

            await _companyRepository.AddAsync(
                company,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return new CompanyDto
            {
                CompanyId = company.CompanyId,
                Name = company.Name,
                Code = company.Code,
                IsInternal = company.IsInternal,
                IsActive = company.IsActive
            };
        }

        public async Task<bool> UpdateAsync(
            int companyId,
            CompanyRequest request,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Company>()
                    .Where(x => x.CompanyId == companyId)
                    .WithTracking();

            var company =
                await _companyRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (company is null)
                return false;

            company.Name = request.Name;
            company.Code = request.Code;
            company.IsInternal = request.IsInternal;
            company.IsActive = request.IsActive;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        public async Task<bool> DeleteAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Company>()
                    .Where(x => x.CompanyId == companyId)
                    .WithTracking();

            var company =
                await _companyRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (company is null)
                return false;

            _companyRepository.Delete(company);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }
    }
}
