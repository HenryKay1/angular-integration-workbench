using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Services.Access.Interfaces
{

    public interface IPermissionService
    {
        Task<Permission?> GetByIdAsync(
            int permissionId,
            CancellationToken cancellationToken = default);

        Task<Permission?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Permission>> GetAllAsync(
            CancellationToken cancellationToken = default);

        Task<Permission> CreateAsync(
            Permission permission,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            Permission permission,
            CancellationToken cancellationToken = default);
    }
}
