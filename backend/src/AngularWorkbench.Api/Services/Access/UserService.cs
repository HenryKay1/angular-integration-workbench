using Microsoft.EntityFrameworkCore;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Services.Access.Interfaces;

namespace AngularWorkbench.Api.Services.Access
{
    public sealed class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UserService(
            IUserRepository userRepository,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public Task<AppUser?> GetByIdAsync(
            int appUserId,
            CancellationToken cancellationToken = default)
        {
            return _userRepository.GetByIdAsync(
                appUserId,
                cancellationToken);
        }

        public Task<AppUser?> GetByEmailAsync(
            string email,
            CancellationToken cancellationToken = default)
        {
            return _userRepository.GetByEmailAsync(
                email,
                cancellationToken);
        }

        public Task<IReadOnlyList<AppUser>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            return _userRepository.GetByCompanyIdAsync(
                companyId,
                cancellationToken);
        }

        public Task<IReadOnlyList<AppUser>> GetByLocationIdAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            return _userRepository.GetByLocationIdAsync(
                locationId,
                cancellationToken);
        }

        public async Task<AppUser> CreateAsync(
            AppUser user,
            CancellationToken cancellationToken = default)
        {
            await _userRepository.AddAsync(
                user,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return user;
        }

        public async Task UpdateAsync(
            AppUser user,
            CancellationToken cancellationToken = default)
        {
            _userRepository.Update(user);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }

        public async Task DeactivateAsync(
            int appUserId,
            CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByIdAsync(
                appUserId,
                cancellationToken);

            if (user is null)
                return;

            user.IsActive = false;

            _userRepository.Update(user);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }
    }
}
