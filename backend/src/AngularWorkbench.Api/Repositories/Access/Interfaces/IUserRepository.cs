using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Repositories.Access.Interfaces
{
    public interface IUserRepository
        : IRepositoryBase<AppUser>
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
    }
}
