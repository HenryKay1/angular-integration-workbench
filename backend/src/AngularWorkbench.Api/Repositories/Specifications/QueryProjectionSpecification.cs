using System.Linq.Expressions;

namespace AngularWorkbench.Api.Repositories.Specifications
{
    public sealed class QueryProjectionSpecification<TEntity, TResult>
    : ProjectionSpecification<TEntity, TResult>
    {
        public QueryProjectionSpecification<TEntity, TResult> Where(
            Expression<Func<TEntity, bool>> filter)
        {
            AddFilter(filter);
            return this;
        }

        public QueryProjectionSpecification<TEntity, TResult> Select(
            Expression<Func<TEntity, TResult>> selector)
        {
            SetSelector(selector);
            return this;
        }

        public QueryProjectionSpecification<TEntity, TResult> OrderBy(
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy)
        {
            SetOrderBy(orderBy);
            return this;
        }

        public QueryProjectionSpecification<TEntity, TResult> Page(
            int pageNumber,
            int pageSize)
        {
            ApplyPaging(pageNumber, pageSize);
            return this;
        }
    }
}
