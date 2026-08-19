using AngularWorkbench.Api.Domain.Entities;

namespace AngularWorkbench.Api.Services.Access.Interfaces
{

    public interface IRoleService
    {
        Task<Role?> GetByIdAsync(
            int roleId,
            CancellationToken cancellationToken = default);

        Task<Role?> GetByNameAsync(
            string name,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Role>> GetActiveAsync(
            CancellationToken cancellationToken = default);

        Task<Role> CreateAsync(
            Role role,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            Role role,
            CancellationToken cancellationToken = default);

        Task DeactivateAsync(
            int roleId,
            CancellationToken cancellationToken = default);
    }
}
