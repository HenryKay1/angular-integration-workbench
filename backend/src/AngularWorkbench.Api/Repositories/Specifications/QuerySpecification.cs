using System.Linq.Expressions;

namespace AngularWorkbench.Api.Repositories.Specifications
{
    public sealed class QuerySpecification<TEntity>
    : Specification<TEntity>
    {
        public QuerySpecification<TEntity> Where(
            Expression<Func<TEntity, bool>> filter)
        {
            AddFilter(filter);
            return this;
        }

        public QuerySpecification<TEntity> Include(
            Func<IQueryable<TEntity>, IQueryable<TEntity>> include)
        {
            AddInclude(include);
            return this;
        }

        public QuerySpecification<TEntity> OrderBy(
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy)
        {
            SetOrderBy(orderBy);
            return this;
        }

        public QuerySpecification<TEntity> Page(
            int pageNumber,
            int pageSize)
        {
            ApplyPaging(pageNumber, pageSize);
            return this;
        }

        public QuerySpecification<TEntity> WithTracking()
        {
            EnableTracking();
            return this;
        }

        public QuerySpecification<TEntity> SplitQuery()
        {
            UseSplitQuery();
            return this;
        }
    }
}
