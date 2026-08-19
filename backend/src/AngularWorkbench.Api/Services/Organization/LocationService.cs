using Microsoft.EntityFrameworkCore;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Services.Organization.Interfaces;

namespace AngularWorkbench.Api.Services.Organization
{
    public sealed class LocationService
        : ILocationService
    {
        private readonly ILocationRepository _locationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public LocationService(
            ILocationRepository locationRepository,
            IUnitOfWork unitOfWork)
        {
            _locationRepository = locationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Location?> GetByIdAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            return await _locationRepository.GetByIdAsync(
                locationId,
                cancellationToken);
        }


        public async Task<IReadOnlyList<Location>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            return await _locationRepository.GetByCompanyIdAsync(
                companyId,
                cancellationToken);
        }
        public async Task<Location?> GetWithAddressAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            return await _locationRepository.GetWithAddressAsync(
                locationId,
                cancellationToken);
        }

        public async Task<Address?> GetAddressAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            return await _locationRepository.GetAddressAsync(
                locationId,
                cancellationToken);
        }

        public async Task<Location> CreateAsync(
            Location location,
            CancellationToken cancellationToken = default)
        {
            await _locationRepository.AddAsync(
                location,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return location;
        }

        public async Task UpdateAsync(
            Location location,
            CancellationToken cancellationToken = default)
        {
            _locationRepository.Update(location);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }

        public async Task DeleteAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            var location =
                await _locationRepository.GetByIdAsync(
                    locationId,
                    cancellationToken);

            if (location is null)
            {
                return;
            }

            _locationRepository.Delete(location);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }
    }
}
