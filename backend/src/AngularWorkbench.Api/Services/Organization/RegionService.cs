using Microsoft.EntityFrameworkCore;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
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

        public Task<Region?> GetByIdAsync(
            int regionId,
            CancellationToken cancellationToken = default)
        {
            return _regionRepository.GetByIdAsync(
                regionId,
                cancellationToken);
        }

        public Task<Region?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default)
        {
            return _regionRepository.GetByCodeAsync(
                code,
                cancellationToken);
        }

        public Task<IReadOnlyList<Region>> GetActiveAsync(
            CancellationToken cancellationToken = default)
        {
            return _regionRepository.GetActiveAsync(
                cancellationToken);
        }

        public async Task<Region> CreateAsync(
            Region region,
            CancellationToken cancellationToken = default)
        {
            await _regionRepository.AddAsync(
                region,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return region;
        }

        public async Task UpdateAsync(
            Region region,
            CancellationToken cancellationToken = default)
        {
            _regionRepository.Update(region);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }

        public async Task DeactivateAsync(
            int regionId,
            CancellationToken cancellationToken = default)
        {
            var region = await _regionRepository.GetByIdAsync(
                regionId,
                cancellationToken);

            if (region is null)
                return;

            region.IsActive = false;

            _regionRepository.Update(region);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }
    }
}
