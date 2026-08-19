using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Services.Access.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Services.Access
{
    public sealed class PermissionService
        : IPermissionService
    {
        private readonly IPermissionRepository _permissionRepository;
        private readonly IUnitOfWork _unitOfWork;

        public PermissionService(
            IPermissionRepository permissionRepository,
            IUnitOfWork unitOfWork)
        {
            _permissionRepository = permissionRepository;
            _unitOfWork = unitOfWork;
        }

        public Task<Permission?> GetByIdAsync(
            int permissionId,
            CancellationToken cancellationToken = default)
        {
            return _permissionRepository.GetByIdAsync(
                permissionId,
                cancellationToken);
        }

        public Task<Permission?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default)
        {
            return _permissionRepository.GetByCodeAsync(
                code,
                cancellationToken);
        }

        public Task<IReadOnlyList<Permission>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return _permissionRepository.GetAllAsync(
                cancellationToken);
        }

        public async Task<Permission> CreateAsync(
            Permission permission,
            CancellationToken cancellationToken = default)
        {
            await _permissionRepository.AddAsync(
                permission,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return permission;
        }

        public async Task UpdateAsync(
            Permission permission,
            CancellationToken cancellationToken = default)
        {
            _permissionRepository.Update(permission);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }
    }
}
