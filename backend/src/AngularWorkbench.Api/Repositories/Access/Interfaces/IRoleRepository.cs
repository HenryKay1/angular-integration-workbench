using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Repositories.Access.Interfaces
{
    public interface IRoleRepository
       : IRepositoryBase<Role>
    {
        Task<Role?> GetByIdAsync(
            int roleId,
            CancellationToken cancellationToken = default);

        IQueryable<RoleDto> GetRolesDataViewQuery();

        Task<Role?> GetByNameAsync(
            string name,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Role>> GetActiveAsync(
            CancellationToken cancellationToken = default);
    }
}
