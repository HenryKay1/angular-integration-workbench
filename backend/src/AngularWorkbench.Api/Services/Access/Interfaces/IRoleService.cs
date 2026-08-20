using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;

namespace AngularWorkbench.Api.Services.Access.Interfaces
{

    public interface IRoleService
    {
        Task<RoleDto?> GetByIdAsync(
            int roleId,
            CancellationToken cancellationToken = default);

        Task<RoleDetailsDto?> GetDetailsAsync(
            int roleId,
            CancellationToken cancellationToken = default);

        Task<RoleDto?> GetByNameAsync(
            string name,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<RoleDto>> GetActiveAsync(
            CancellationToken cancellationToken = default);

        Task<RoleDto> CreateAsync(
            RoleRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            int roleId,
            RoleRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeactivateAsync(
            int roleId,
            CancellationToken cancellationToken = default);
    }
}
