using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Repositories.Access
{
    public sealed class RoleRepository
        : RepositoryBase<Role>,
          IRoleRepository
    {
        public RoleRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<Role?> GetByIdAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Include(x => x.CompanyScope)
                .FirstOrDefaultAsync(
                    x => x.RoleId == roleId,
                    cancellationToken);
        }

        public async Task<Role?> GetByNameAsync(
            string name,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Name == name,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<Role>> GetActiveAsync(
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync(cancellationToken);
        }
    }
}
