using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Services.Access.Interfaces
{

    public interface IPermissionService
    {
        Task<PermissionDto?> GetByIdAsync(
            int permissionId,
            CancellationToken cancellationToken = default);

        Task<PermissionDto?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<PermissionDto>> GetAllAsync(
            CancellationToken cancellationToken = default);

        Task<PermissionDto> CreateAsync(
            PermissionRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateAsync(
            int permissionId,
            PermissionRequest request,
            CancellationToken cancellationToken = default);
    }
}
