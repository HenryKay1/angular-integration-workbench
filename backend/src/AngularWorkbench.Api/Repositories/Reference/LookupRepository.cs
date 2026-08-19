using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Extensions;
using AngularWorkbench.Api.Models.Entities.Reference.Enums;
using AngularWorkbench.Api.Repositories.Reference.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Repositories.Reference
{
    public sealed class LookupRepository
     : RepositoryBase<Lookup>,
       ILookupRepository
    {
        public LookupRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<Lookup?> GetByIdAsync(
            int lookupId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.LookupId == lookupId,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<Lookup>> GetByCategoryAsync(
            LookupCategoryEnum category,
            CancellationToken cancellationToken = default)
        {
            var categoryValue = (int)category;

            return await DbSet
                .AsNoTracking()
                .Where(x =>
                    x.LookupCategory.Value == categoryValue &&
                    x.LookupCategory.IsActive &&
                    x.IsActive)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<Lookup?> GetByValueAsync(
            LookupCategoryEnum category,
            int value,
            CancellationToken cancellationToken = default)
        {
            var categoryValue = (int)category;

            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x =>
                        x.LookupCategory.Value == categoryValue &&
                        x.Value == value &&
                        x.IsActive,
                    cancellationToken);
        }

        public async Task<Lookup?> GetByCodeAsync(
            LookupCategoryEnum category,
            string code,
            CancellationToken cancellationToken = default)
        {
            var categoryValue = (int)category;

            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x =>
                        x.LookupCategory.Value == categoryValue &&
                        x.Code == code &&
                        x.IsActive,
                    cancellationToken);
        }
    }
}
