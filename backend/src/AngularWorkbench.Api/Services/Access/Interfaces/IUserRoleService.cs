using AngularWorkbench.Api.Domain.Entities;

namespace AngularWorkbench.Api.Services.Access.Interfaces
{

    public interface IUserRoleService
    {
        Task<AppUserRole?> GetByIdAsync(
            int appUserRoleId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppUserRole>> GetByUserIdAsync(
            int appUserId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppUserRole>> GetByRoleIdAsync(
            int roleId,
            CancellationToken cancellationToken = default);

        Task<AppUserRole> AssignAsync(
            AppUserRole assignment,
            CancellationToken cancellationToken = default);

        Task RemoveAsync(
            int appUserRoleId,
            CancellationToken cancellationToken = default);
    }
}
