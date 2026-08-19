using Microsoft.EntityFrameworkCore;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Services.Access.Interfaces;

namespace AngularWorkbench.Api.Services.Access
{
    public sealed class UserRoleService
    : IUserRoleService
    {
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UserRoleService(
            IUserRoleRepository userRoleRepository,
            IUnitOfWork unitOfWork)
        {
            _userRoleRepository = userRoleRepository;
            _unitOfWork = unitOfWork;
        }

        public Task<AppUserRole?> GetByIdAsync(
            int appUserRoleId,
            CancellationToken cancellationToken = default)
        {
            return _userRoleRepository.GetByIdAsync(
                appUserRoleId,
                cancellationToken);
        }

        public Task<IReadOnlyList<AppUserRole>> GetByUserIdAsync(
            int appUserId,
            CancellationToken cancellationToken = default)
        {
            return _userRoleRepository.GetByUserIdAsync(
                appUserId,
                cancellationToken);
        }

        public Task<IReadOnlyList<AppUserRole>> GetByRoleIdAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            return _userRoleRepository.GetByRoleIdAsync(
                roleId,
                cancellationToken);
        }

        public async Task<AppUserRole> AssignAsync(
            AppUserRole assignment,
            CancellationToken cancellationToken = default)
        {
            await _userRoleRepository.AddAsync(
                assignment,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return assignment;
        }

        public async Task RemoveAsync(
            int appUserRoleId,
            CancellationToken cancellationToken = default)
        {
            var assignment =
                await _userRoleRepository.GetByIdAsync(
                    appUserRoleId,
                    cancellationToken);

            if (assignment is null)
                return;

            _userRoleRepository.Delete(assignment);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }
    }
}
