using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Services.Organization.Interfaces;

namespace AngularWorkbench.Api.Services.Organization
{
    public sealed class RegionService : IRegionService
    {
        private readonly IRegionRepository _regionRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RegionService(
            IRegionRepository regionRepository,
            IUnitOfWork unitOfWork)
        {
            _regionRepository = regionRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<RegionDto?> GetByIdAsync(
            int regionId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Region, RegionDto>()
                    .Where(x => x.RegionId == regionId)
                    .Select(x => new RegionDto
                    {
                        RegionId = x.RegionId,
                        Name = x.Name,
                        Code = x.Code,
                        IsActive = x.IsActive
                    });

            return await _regionRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<RegionDto?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Region, RegionDto>()
                    .Where(x => x.Code == code)
                    .Select(x => new RegionDto
                    {
                        RegionId = x.RegionId,
                        Name = x.Name,
                        Code = x.Code,
                        IsActive = x.IsActive
                    });

            return await _regionRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<RegionDto>> GetActiveAsync(
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Region, RegionDto>()
                    .Where(x => x.IsActive)
                    .Select(x => new RegionDto
                    {
                        RegionId = x.RegionId,
                        Name = x.Name,
                        Code = x.Code,
                        IsActive = x.IsActive
                    });

            return await _regionRepository
                .ListAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<RegionDto> CreateAsync(
            RegionRequest request,
            CancellationToken cancellationToken = default)
        {
            var region = new Region
            {
                Name = request.Name,
                Code = request.Code,
                IsActive = request.IsActive
            };

            await _regionRepository.AddAsync(
                region,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return MapToDto(region);
        }

        public async Task<bool> UpdateAsync(
            int regionId,
            RegionRequest request,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Region>()
                    .Where(x => x.RegionId == regionId)
                    .WithTracking();

            var region =
                await _regionRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (region is null)
            {
                return false;
            }

            region.Name = request.Name;
            region.Code = request.Code;
            region.IsActive = request.IsActive;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        public async Task<bool> DeactivateAsync(
            int regionId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Region>()
                    .Where(x => x.RegionId == regionId)
                    .WithTracking();

            var region =
                await _regionRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (region is null)
            {
                return false;
            }

            region.IsActive = false;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        private static RegionDto MapToDto(
            Region region)
        {
            return new RegionDto
            {
                RegionId = region.RegionId,
                Name = region.Name,
                Code = region.Code,
                IsActive = region.IsActive
            };
        }
    }
}