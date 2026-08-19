namespace AngularWorkbench.Api.Repositories.Specifications.Interfaces
{
    public interface IReadRepository<TEntity>
       where TEntity : class
    {
        Task<IReadOnlyList<TEntity>> ListAsync(
            ISpecification<TEntity> specification,
            CancellationToken cancellationToken = default);

        Task<TEntity?> FirstOrDefaultAsync(
            ISpecification<TEntity> specification,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<TResult>> ListAsync<TResult>(
            IProjectionSpecification<TEntity, TResult> specification,
            CancellationToken cancellationToken = default);

        Task<TResult?> FirstOrDefaultAsync<TResult>(
            IProjectionSpecification<TEntity, TResult> specification,
            CancellationToken cancellationToken = default);

        Task<int> CountAsync(
            ISpecification<TEntity> specification,
            CancellationToken cancellationToken = default);
    }
}
