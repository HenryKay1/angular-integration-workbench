using Microsoft.EntityFrameworkCore;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Services.Access.Interfaces;

namespace AngularWorkbench.Api.Services.Access
{
    public sealed class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RoleService(
            IRoleRepository roleRepository,
            IUnitOfWork unitOfWork)
        {
            _roleRepository = roleRepository;
            _unitOfWork = unitOfWork;
        }

        public Task<Role?> GetByIdAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            return _roleRepository.GetByIdAsync(
                roleId,
                cancellationToken);
        }

        public Task<Role?> GetByNameAsync(
            string name,
            CancellationToken cancellationToken = default)
        {
            return _roleRepository.GetByNameAsync(
                name,
                cancellationToken);
        }

        public Task<IReadOnlyList<Role>> GetActiveAsync(
            CancellationToken cancellationToken = default)
        {
            return _roleRepository.GetActiveAsync(
                cancellationToken);
        }

        public async Task<Role> CreateAsync(
            Role role,
            CancellationToken cancellationToken = default)
        {
            await _roleRepository.AddAsync(
                role,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return role;
        }

        public async Task UpdateAsync(
            Role role,
            CancellationToken cancellationToken = default)
        {
            _roleRepository.Update(role);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }

        public async Task DeactivateAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            var role = await _roleRepository.GetByIdAsync(
                roleId,
                cancellationToken);

            if (role is null)
                return;

            role.IsActive = false;

            _roleRepository.Update(role);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }
    }
}
