using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Repositories.Access.Interfaces
{
    public interface IRoleRepository
       : IRepositoryBase<Role>
    {
        Task<Role?> GetByIdAsync(
            int roleId,
            CancellationToken cancellationToken = default);

        Task<Role?> GetByNameAsync(
            string name,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Role>> GetActiveAsync(
            CancellationToken cancellationToken = default);
    }
}
