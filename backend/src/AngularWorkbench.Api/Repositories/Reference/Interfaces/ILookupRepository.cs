using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.Entities.Reference.Enums;
using AngularWorkbench.Api.Repositories.Interfaces;

namespace AngularWorkbench.Api.Repositories.Reference.Interfaces
{
    public interface ILookupRepository
       : IRepositoryBase<Lookup>
    {
        Task<Lookup?> GetByIdAsync(
        int lookupId,
        CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Lookup>> GetByCategoryAsync(
            LookupCategoryEnum category,
            CancellationToken cancellationToken = default);

        Task<Lookup?> GetByValueAsync(
            LookupCategoryEnum category,
            int value,
            CancellationToken cancellationToken = default);

        Task<Lookup?> GetByCodeAsync(
            LookupCategoryEnum category,
            string code,
            CancellationToken cancellationToken = default);
    }
}
