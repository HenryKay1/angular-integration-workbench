using AngularWorkbench.Api.Repositories.Specifications.Interfaces;
using System.Linq.Expressions;

namespace AngularWorkbench.Api.Repositories.Specifications
{
    public abstract class Specification<TEntity>
        : ISpecification<TEntity>
    {
        private readonly List<Expression<Func<TEntity, bool>>> _filters = new();

        private readonly List<Func<IQueryable<TEntity>, IQueryable<TEntity>>> _includes =
            new();

        public IReadOnlyList<Expression<Func<TEntity, bool>>> Filters => _filters;

        public IReadOnlyList<Func<IQueryable<TEntity>, IQueryable<TEntity>>> Includes =>
            _includes;

        public Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? OrderBy
        {
            get;
            private set;
        }

        public int Skip { get; private set; }

        public int Take { get; private set; }

        public bool IsPagingEnabled { get; private set; }

        public bool AsNoTracking { get; private set; } = true;

        public bool AsSplitQuery { get; private set; }

        protected void AddFilter(
            Expression<Func<TEntity, bool>> filter)
        {
            _filters.Add(filter);
        }

        protected void AddInclude(
            Func<IQueryable<TEntity>, IQueryable<TEntity>> include)
        {
            _includes.Add(include);
        }

        protected void SetOrderBy(
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy)
        {
            OrderBy = orderBy;
        }

        protected void ApplyPaging(
            int pageNumber,
            int pageSize)
        {
            pageNumber = Math.Max(pageNumber, 1);
            pageSize = Math.Max(pageSize, 1);

            Skip = (pageNumber - 1) * pageSize;
            Take = pageSize;

            IsPagingEnabled = true;
        }

        protected void EnableTracking()
        {
            AsNoTracking = false;
        }

        protected void UseSplitQuery()
        {
            AsSplitQuery = true;
        }
    }
}
