using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Services.Access.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Services.Access
{
    public sealed class PermissionService : IPermissionService
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

        public async Task<PermissionDto?> GetByIdAsync(
            int permissionId,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Permission, PermissionDto>()
                    .Where(x => x.PermissionId == permissionId)
                    .Select(x => new PermissionDto
                    {
                        PermissionId = x.PermissionId,
                        Code = x.Code,
                        Name = x.Name,
                        Description = x.Description
                    });

            return await _permissionRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);
        }

        public async Task<PermissionDto?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Permission, PermissionDto>()
                    .Where(x => x.Code == code)
                    .Select(x => new PermissionDto
                    {
                        PermissionId = x.PermissionId,
                        Code = x.Code,
                        Name = x.Name,
                        Description = x.Description
                    });

            return await _permissionRepository.FirstOrDefaultAsync(
                specification,
                cancellationToken);
        }

        public async Task<IReadOnlyList<PermissionDto>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QueryProjectionSpecification<Permission, PermissionDto>()
                    .Select(x => new PermissionDto
                    {
                        PermissionId = x.PermissionId,
                        Code = x.Code,
                        Name = x.Name,
                        Description = x.Description
                    });

            return await _permissionRepository.ListAsync(
                specification,
                cancellationToken);
        }

        public async Task<PermissionDto> CreateAsync(
            PermissionRequest request,
            CancellationToken cancellationToken = default)
        {
            var permission = new Permission
            {
                Code = request.Code,
                Name = request.Name,
                Description = request.Description
            };

            await _permissionRepository.AddAsync(
                permission,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return MapToDto(permission);
        }

        public async Task<bool> UpdateAsync(
            int permissionId,
            PermissionRequest request,
            CancellationToken cancellationToken = default)
        {
            var specification =
                new QuerySpecification<Permission>()
                    .Where(x => x.PermissionId == permissionId)
                    .WithTracking();

            var permission =
                await _permissionRepository.FirstOrDefaultAsync(
                    specification,
                    cancellationToken);

            if (permission is null)
            {
                return false;
            }

            permission.Code = request.Code;
            permission.Name = request.Name;
            permission.Description = request.Description;

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        private static PermissionDto MapToDto(
            Permission permission)
        {
            return new PermissionDto
            {
                PermissionId = permission.PermissionId,
                Code = permission.Code,
                Name = permission.Name,
                Description = permission.Description
            };
        }
    }
}
