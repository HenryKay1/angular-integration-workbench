using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.Entities.Reference.Enums;

namespace AngularWorkbench.Api.Services.Reference.Interfaces
{
    public interface ILookupService
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

        Task<Lookup> CreateAsync(
            Lookup lookup,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            Lookup lookup,
            CancellationToken cancellationToken = default);

        Task DeactivateAsync(
            int lookupId,
            CancellationToken cancellationToken = default);
    }
}
