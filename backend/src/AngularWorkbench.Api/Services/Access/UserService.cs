using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Services.Access.Interfaces;

namespace AngularWorkbench.Api.Services.Access
{
    public sealed class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UserService(
            IUserRepository userRepository,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<AppUserDto?> GetByIdAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<AppUser, AppUserDto>()
                    .Where(x => x.AppUserId == userId)
                    .Select(x => new AppUserDto
                    {
                        AppUserId = x.AppUserId,
                        FirstName = x.FirstName,
                        LastName = x.LastName,
                        Email = x.Email,
                        IsActive = x.IsActive,
                        CreatedUtc = x.CreatedUtc,
                        CompanyId = x.CompanyId,
                        LocationId = x.LocationId
                    });

            return await _userRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);
        }

        public async Task<AppUserDetailsDto?> GetDetailsAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<AppUser, AppUserDetailsDto>()
                    .Where(x => x.AppUserId == userId)
                    .Select(x => new AppUserDetailsDto
                    {
                        AppUserId = x.AppUserId,
                        FirstName = x.FirstName,
                        LastName = x.LastName,
                        Email = x.Email,
                        IsActive = x.IsActive,
                        CreatedUtc = x.CreatedUtc,

                        CompanyId = x.CompanyId,
                        CompanyName = x.Company.Name,

                        LocationId = x.LocationId,
                        LocationName = x.Location != null
                            ? x.Location.Name
                            : null,

                        Roles = x.UserRoles
                            .Select(userRole => new AppUserRoleDto
                            {
                                AppUserRoleId =
                                    userRole.AppUserRoleId,

                                AppUserId =
                                    userRole.AppUserId,

                                RoleId =
                                    userRole.RoleId,

                                RoleName =
                                    userRole.Role.Name,

                                AccessScopeValue =
                                    userRole.AccessScope.Value,

                                AccessScopeName =
                                    userRole.AccessScope.Name,

                                CompanyId =
                                    userRole.CompanyId,

                                CompanyName =
                                    userRole.Company != null
                                        ? userRole.Company.Name
                                        : null,

                                RegionId =
                                    userRole.RegionId,

                                RegionName =
                                    userRole.Region != null
                                        ? userRole.Region.Name
                                        : null
                            })
                            .ToList()
                    });

            return await _userRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);
        }

        public async Task<AppUserDto?> GetByEmailAsync(
            string email,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<AppUser, AppUserDto>()
                    .Where(x => x.Email == email)
                    .Select(x => new AppUserDto
                    {
                        AppUserId = x.AppUserId,
                        FirstName = x.FirstName,
                        LastName = x.LastName,
                        Email = x.Email,
                        IsActive = x.IsActive,
                        CreatedUtc = x.CreatedUtc,
                        CompanyId = x.CompanyId,
                        LocationId = x.LocationId
                    });

            return await _userRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);
        }

        public async Task<IReadOnlyList<AppUserDto>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<AppUser, AppUserDto>()
                    .Where(x => x.CompanyId == companyId)
                    .Select(x => new AppUserDto
                    {
                        AppUserId = x.AppUserId,
                        FirstName = x.FirstName,
                        LastName = x.LastName,
                        Email = x.Email,
                        IsActive = x.IsActive,
                        CreatedUtc = x.CreatedUtc,
                        CompanyId = x.CompanyId,
                        LocationId = x.LocationId
                    });

            return await _userRepository.ListAsync(
                specification,
                cancellationToken);
        }

        public async Task<IReadOnlyList<AppUserDto>> GetByLocationIdAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<AppUser, AppUserDto>()
                    .Where(x => x.LocationId == locationId)
                    .Select(x => new AppUserDto
                    {
                        AppUserId = x.AppUserId,
                        FirstName = x.FirstName,
                        LastName = x.LastName,
                        Email = x.Email,
                        IsActive = x.IsActive,
                        CreatedUtc = x.CreatedUtc,
                        CompanyId = x.CompanyId,
                        LocationId = x.LocationId
                    });

            return await _userRepository.ListAsync(
                specification,
                cancellationToken);
        }

        public async Task<AppUserDto> CreateAsync(
            AppUserRequest request,
            CancellationToken cancellationToken = default)
        {
            var user = new AppUser
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,

                CompanyId = request.CompanyId,
                LocationId = request.LocationId,

                IsActive = request.IsActive,
                CreatedUtc = DateTime.UtcNow
            };

            await _userRepository.AddAsync(
                user,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return MapToDto(user);
        }

        public async Task<bool> UpdateAsync(
            int userId,
            AppUserRequest request,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<AppUser>()
                    .Where(x => x.AppUserId == userId)
                    .WithTracking();

            var user =
                await _userRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (user is null)
            {
                return false;
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;

            user.CompanyId = request.CompanyId;
            user.LocationId = request.LocationId;

            user.IsActive = request.IsActive;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        public async Task<bool> DeactivateAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<AppUser>()
                    .Where(x => x.AppUserId == userId)
                    .WithTracking();

            var user =
                await _userRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (user is null)
            {
                return false;
            }

            user.IsActive = false;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        private static AppUserDto MapToDto(
            AppUser user)
        {
            return new AppUserDto
            {
                AppUserId = user.AppUserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                IsActive = user.IsActive,
                CreatedUtc = user.CreatedUtc,
                CompanyId = user.CompanyId,
                LocationId = user.LocationId
            };
        }
    }
}