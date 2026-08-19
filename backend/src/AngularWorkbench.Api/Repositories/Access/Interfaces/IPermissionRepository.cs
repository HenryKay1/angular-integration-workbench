using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Repositories.Access.Interfaces
{
    public interface IPermissionRepository
        : IRepositoryBase<Permission>
    {
        Task<Permission?> GetByIdAsync(
            int permissionId,
            CancellationToken cancellationToken = default);

        Task<Permission?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Permission>> GetAllAsync(
            CancellationToken cancellationToken = default);
    }
}
