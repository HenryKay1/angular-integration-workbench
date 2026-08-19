using AngularWorkbench.Api.Repositories.Specifications.Interfaces;

namespace AngularWorkbench.Api.Repositories.Interfaces
{
    public interface IRepositoryBase<TEntity>
        : IReadRepository<TEntity>
        where TEntity : class
    {
        Task AddAsync(
            TEntity entity,
            CancellationToken cancellationToken = default);

        void Update(TEntity entity);

        void Delete(TEntity entity);

    }
}
