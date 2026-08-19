using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Repositories.Access
{
    public sealed class UserRoleRepository
         : RepositoryBase<AppUserRole>,
           IUserRoleRepository
    {
        public UserRoleRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<AppUserRole?> GetByIdAsync(
            int appUserRoleId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Include(x => x.Role)
                .Include(x => x.AccessScope)
                .Include(x => x.Company)
                .Include(x => x.Region)
                .FirstOrDefaultAsync(
                    x => x.AppUserRoleId == appUserRoleId,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<AppUserRole>> GetByUserIdAsync(
            int appUserId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Where(x => x.AppUserId == appUserId)
                .Include(x => x.Role)
                .Include(x => x.AccessScope)
                .Include(x => x.Company)
                .Include(x => x.Region)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<AppUserRole>> GetByRoleIdAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Where(x => x.RoleId == roleId)
                .Include(x => x.AppUser)
                .Include(x => x.AccessScope)
                .Include(x => x.Company)
                .Include(x => x.Region)
                .ToListAsync(cancellationToken);
        }
    }
}
