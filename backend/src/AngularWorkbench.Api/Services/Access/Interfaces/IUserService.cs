using AngularWorkbench.Api.Domain.Entities;

namespace AngularWorkbench.Api.Services.Access.Interfaces
{

    public interface IUserService
    {
        Task<AppUser?> GetByIdAsync(
            int appUserId,
            CancellationToken cancellationToken = default);

        Task<AppUser?> GetByEmailAsync(
            string email,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppUser>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppUser>> GetByLocationIdAsync(
            int locationId,
            CancellationToken cancellationToken = default);

        Task<AppUser> CreateAsync(
            AppUser user,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            AppUser user,
            CancellationToken cancellationToken = default);

        Task DeactivateAsync(
            int appUserId,
            CancellationToken cancellationToken = default);
    }
}
