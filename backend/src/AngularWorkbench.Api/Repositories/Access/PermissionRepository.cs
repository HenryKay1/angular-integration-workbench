using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Repositories.Access
{
    public sealed class PermissionRepository
        : RepositoryBase<Permission>,
          IPermissionRepository
    {
        public PermissionRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<Permission?> GetByIdAsync(
            int permissionId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.PermissionId == permissionId,
                    cancellationToken);
        }

        public async Task<Permission?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Code == code,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<Permission>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .ToListAsync(cancellationToken);
        }
    }
}
