using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;

namespace AngularWorkbench.Api.Services.Access.Interfaces
{

    public interface IUserRoleService
    {
        Task<AppUserRoleDto?> GetByIdAsync(
            int appUserRoleId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppUserRoleDto>> GetByUserIdAsync(
            int userId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AppUserRoleDto>> GetByRoleIdAsync(
            int roleId,
            CancellationToken cancellationToken = default);

        Task<AppUserRoleDto> AssignAsync(
            AppUserRoleRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            int appUserRoleId,
            AppUserRoleRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> RemoveAsync(
            int appUserRoleId,
            CancellationToken cancellationToken = default);
    }
}
