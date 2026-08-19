using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.Entities.Reference.Enums;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Reference.Interfaces;
using AngularWorkbench.Api.Services.Reference.Interfaces;

namespace AngularWorkbench.Api.Services.Reference
{
    public sealed class LookupService
    : ILookupService
    {
        private readonly ILookupRepository _lookupRepository;
        private readonly IUnitOfWork _unitOfWork;

        public LookupService(
            ILookupRepository lookupRepository,
            IUnitOfWork unitOfWork)
        {
            _lookupRepository = lookupRepository;
            _unitOfWork = unitOfWork;
        }

        public Task<Lookup?> GetByIdAsync(
            int lookupId,
            CancellationToken cancellationToken = default)
        {
            return _lookupRepository.GetByIdAsync(
                lookupId,
                cancellationToken);
        }

        public Task<IReadOnlyList<Lookup>> GetByCategoryAsync(
            LookupCategoryEnum category,
            CancellationToken cancellationToken = default)
        {
            return _lookupRepository.GetByCategoryAsync(
                category,
                cancellationToken);
        }

        public Task<Lookup?> GetByValueAsync(
            LookupCategoryEnum category,
            int value,
            CancellationToken cancellationToken = default)
        {
            return _lookupRepository.GetByValueAsync(
                category,
                value,
                cancellationToken);
        }

        public Task<Lookup?> GetByCodeAsync(
            LookupCategoryEnum category,
            string code,
            CancellationToken cancellationToken = default)
        {
            return _lookupRepository.GetByCodeAsync(
                category,
                code,
                cancellationToken);
        }

        public async Task<Lookup> CreateAsync(
            Lookup lookup,
            CancellationToken cancellationToken = default)
        {
            await _lookupRepository.AddAsync(
                lookup,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);

            return lookup;
        }

        public async Task UpdateAsync(
            Lookup lookup,
            CancellationToken cancellationToken = default)
        {
            _lookupRepository.Update(lookup);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }

        public async Task DeactivateAsync(
            int lookupId,
            CancellationToken cancellationToken = default)
        {
            var lookup = await _lookupRepository.GetByIdAsync(
                lookupId,
                cancellationToken);

            if (lookup is null)
                return;

            lookup.IsActive = false;

            _lookupRepository.Update(lookup);

            await _unitOfWork.SaveChangesAsync(
                cancellationToken);
        }
    }
}
