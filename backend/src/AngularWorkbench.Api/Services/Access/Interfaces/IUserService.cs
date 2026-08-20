using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;

namespace AngularWorkbench.Api.Services.Access.Interfaces
{

    public interface IUserService
    {
        Task<AppUserDto?> GetByIdAsync(
            int userId,
            CancellationToken cancellationToken = default);

        Task<AppUserDetailsDto?> GetDetailsAsync(
            int userId,
            CancellationToken cancellationToken = default);

        Task<AppUserDto?> GetByEmailAsync(
            string email,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppUserDto>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppUserDto>> GetByLocationIdAsync(
            int locationId,
            CancellationToken cancellationToken = default);

        Task<AppUserDto> CreateAsync(
            AppUserRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            int userId,
            AppUserRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeactivateAsync(
            int userId,
            CancellationToken cancellationToken = default);
    }
}
