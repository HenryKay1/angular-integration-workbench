using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Repositories.Access
{
    public sealed class UserRepository
        : RepositoryBase<AppUser>,
        IUserRepository
    {
        public UserRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<AppUser?> GetByIdAsync(
            int appUserId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.AppUserId == appUserId,
                    cancellationToken);
        }

        public async Task<AppUser?> GetByEmailAsync(
            string email,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Email == email,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<AppUser>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Where(x =>
                    x.CompanyId == companyId &&
                    x.IsActive)
                .OrderBy(x => x.LastName)
                .ThenBy(x => x.FirstName)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<AppUser>> GetByLocationIdAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Where(x =>
                    x.LocationId == locationId &&
                    x.IsActive)
                .OrderBy(x => x.LastName)
                .ThenBy(x => x.FirstName)
                .ToListAsync(cancellationToken);
        }
    }
}
