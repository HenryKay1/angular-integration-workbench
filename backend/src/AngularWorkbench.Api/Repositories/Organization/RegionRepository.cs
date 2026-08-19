using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Repositories.Organization
{
    public sealed class RegionRepository
        : RepositoryBase<Region>,
          IRegionRepository
    {
        public RegionRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<Region?> GetByIdAsync(
            int regionId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.RegionId == regionId,
                    cancellationToken);
        }

        public async Task<Region?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Code == code,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<Region>> GetActiveAsync(
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
