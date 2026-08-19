using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Repositories.Access.Interfaces
{
    public interface IUserRoleRepository
        : IRepositoryBase<AppUserRole>
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
    }
}
