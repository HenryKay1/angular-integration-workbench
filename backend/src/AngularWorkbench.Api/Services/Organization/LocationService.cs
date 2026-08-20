using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Organization;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Services.Organization.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Services.Organization
{
    public sealed class LocationService : ILocationService
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

        public async Task<LocationDto?> GetByIdAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Location, LocationDto>()
                    .Where(x => x.LocationId == locationId)
                    .Select(x => new LocationDto
                    {
                        LocationId = x.LocationId,
                        CompanyId = x.CompanyId,
                        RegionId = x.RegionId,
                        AddressId = x.AddressId,
                        Name = x.Name,
                        Code = x.Code,
                        IsActive = x.IsActive
                    });

            return await _locationRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<LocationDto>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Location, LocationDto>()
                    .Where(x =>
                        x.CompanyId == companyId &&
                        x.IsActive)
                    .Select(x => new LocationDto
                    {
                        LocationId = x.LocationId,
                        CompanyId = x.CompanyId,
                        RegionId = x.RegionId,
                        AddressId = x.AddressId,
                        Name = x.Name,
                        Code = x.Code,
                        IsActive = x.IsActive
                    });

            return await _locationRepository
                .ListAsync(
                    specification,
                    cancellationToken);
        }
        public async Task<LocationDetailsDto?> GetDetailsAsync(
    int locationId,
    CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Location, LocationDetailsDto>()
                    .Where(x => x.LocationId == locationId)
                    .Select(x => new LocationDetailsDto
                    {
                        LocationId = x.LocationId,
                        CompanyId = x.CompanyId,
                        Name = x.Name,
                        Code = x.Code,
                        IsActive = x.IsActive,

                        Region = new RegionDto
                        {
                            RegionId = x.Region.RegionId,
                            Name = x.Region.Name,
                            Code = x.Region.Code,
                            IsActive = x.Region.IsActive
                        },

                        Address = new AddressDto
                        {
                            AddressId = x.Address.AddressId,
                            AddressLine1 = x.Address.AddressLine1,
                            AddressLine2 = x.Address.AddressLine2,
                            PostalCode = x.Address.PostalCode,

                            CountryId = x.Address.CountryId,
                            CountryName = x.Address.Country != null
                                ? x.Address.Country.Name
                                : null,

                            StateId = x.Address.StateId,
                            StateName = x.Address.State != null
                                ? x.Address.State.Name
                                : null,

                            CityId = x.Address.CityId,
                            CityName = x.Address.City != null
                                ? x.Address.City.Name
                                : null
                        }
                    });

            return await _locationRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

        public async Task<LocationDetailsDto?> GetWithAddressAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Location, LocationDetailsDto>()
                    .Where(x => x.LocationId == locationId)
                    .Select(x => new LocationDetailsDto
                    {
                        LocationId = x.LocationId,
                        CompanyId = x.CompanyId,
                        Name = x.Name,
                        Code = x.Code,
                        IsActive = x.IsActive,

                        Region = new RegionDto
                        {
                            RegionId = x.Region.RegionId,
                            Name = x.Region.Name,
                            Code = x.Region.Code,
                            IsActive = x.Region.IsActive
                        },

                        Address = new AddressDto
                        {
                            AddressId = x.Address.AddressId,
                            AddressLine1 = x.Address.AddressLine1,
                            AddressLine2 = x.Address.AddressLine2,
                            PostalCode = x.Address.PostalCode,

                            CountryId = x.Address.CountryId,
                            CountryName = x.Address.Country != null
                                ? x.Address.Country.Name
                                : null,

                            StateId = x.Address.StateId,
                            StateName = x.Address.State != null
                                ? x.Address.State.Name
                                : null,

                            CityId = x.Address.CityId,
                            CityName = x.Address.City != null
                                ? x.Address.City.Name
                                : null
                        }
                    });

            return await _locationRepository
                .FirstOrDefaultAsync(
                    specification,
                    cancellationToken);
        }

       public async Task<LocationDto> CreateAsync(
           LocationRequest request,
           CancellationToken cancellationToken = default)
        {
            var location = new Location
            {
                CompanyId = request.CompanyId,
                RegionId = request.RegionId,
                Name = request.Name,
                Code = request.Code,
                IsActive = request.IsActive,

                Address = new Address
                {
                    AddressLine1 = request.Address.AddressLine1,
                    AddressLine2 = request.Address.AddressLine2,
                    PostalCode = request.Address.PostalCode,
                    CountryId = request.Address.CountryId,
                    StateId = request.Address.StateId,
                    CityId = request.Address.CityId
                }
            };

            await _locationRepository.AddAsync(
                location,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return MapToDto(location);
        }

        public async Task<bool> UpdateAsync(
            int locationId,
            LocationRequest request,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Location>()
                    .Where(x => x.LocationId == locationId)
                    .Include(query =>
                        query.Include(x => x.Address))
                    .WithTracking();

            var location =
                await _locationRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (location is null)
            {
                return false;
            }

            // Location
            location.CompanyId = request.CompanyId;
            location.RegionId = request.RegionId;
            location.Name = request.Name;
            location.Code = request.Code;
            location.IsActive = request.IsActive;

            // Address
            location.Address.AddressLine1 =
                request.Address.AddressLine1;

            location.Address.AddressLine2 =
                request.Address.AddressLine2;

            location.Address.PostalCode =
                request.Address.PostalCode;

            location.Address.CountryId =
                request.Address.CountryId;

            location.Address.StateId =
                request.Address.StateId;

            location.Address.CityId =
                request.Address.CityId;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }
       
        public async Task<bool> DeleteAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Location>()
                    .Where(x => x.LocationId == locationId)
                    .WithTracking();

            var location =
                await _locationRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (location is null)
            {
                return false;
            }

            _locationRepository.Delete(location);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        private static LocationDto MapToDto(Location location)
        {
            return new LocationDto
            {
                LocationId = location.LocationId,
                CompanyId = location.CompanyId,
                RegionId = location.RegionId,
                AddressId = location.AddressId,
                Name = location.Name,
                Code = location.Code,
                IsActive = location.IsActive
            };
        }
    }
}