using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Repositories.Organization
{
    public sealed class LocationRepository
        : RepositoryBase<Location>,
          ILocationRepository
    {
        public LocationRepository(AppDbContext context)
            : base(context)
        {
        }

        public async Task<Location?> GetByIdAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.LocationId == locationId,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<Location>> GetByCompanyIdAsync(
            int companyId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Where(x =>
                    x.CompanyId == companyId)
                .OrderBy(x => x.Name)
                .ToListAsync(cancellationToken);
        }
        public async Task<Location?> GetWithAddressAsync(
        int locationId,
        CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Include(x => x.Address)
                    .ThenInclude(x => x.Country)
                .Include(x => x.Address)
                    .ThenInclude(x => x.State)
                .Include(x => x.Address)
                    .ThenInclude(x => x.City)
                .FirstOrDefaultAsync(
                    x => x.LocationId == locationId,
                    cancellationToken);
        }

        public async Task<Address?> GetAddressAsync(
            int locationId,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .AsNoTracking()
                .Where(x => x.LocationId == locationId)
                .Select(x => x.Address)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
