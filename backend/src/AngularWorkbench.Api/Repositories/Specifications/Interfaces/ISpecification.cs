using System.Linq.Expressions;

namespace AngularWorkbench.Api.Repositories.Specifications.Interfaces
{
    public interface ISpecification<TEntity>
    {
        IReadOnlyList<Expression<Func<TEntity, bool>>> Filters { get; }

        IReadOnlyList<Func<IQueryable<TEntity>, IQueryable<TEntity>>> Includes { get; }

        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? OrderBy { get; }

        int Skip { get; }

        int Take { get; }

        bool IsPagingEnabled { get; }

        bool AsNoTracking { get; }

        bool AsSplitQuery { get; }
    }
}
