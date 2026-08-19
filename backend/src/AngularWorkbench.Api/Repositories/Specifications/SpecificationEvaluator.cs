using AngularWorkbench.Api.Repositories.Specifications.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace AngularWorkbench.Api.Repositories.Specifications
{
    public static class SpecificationEvaluator
    {
        public static IQueryable<TEntity> GetQuery<TEntity>(
            IQueryable<TEntity> query,
            ISpecification<TEntity> specification,
            bool applyIncludes = true,
            bool applyOrdering = true,
            bool applyPaging = true)
            where TEntity : class
        {
            foreach (var filter in specification.Filters)
            {
                query = query.Where(filter);
            }

            if (applyIncludes)
            {
                foreach (var include in specification.Includes)
                {
                    query = include(query);
                }
            }

            if (applyOrdering &&
                specification.OrderBy is not null)
            {
                query = specification.OrderBy(query);
            }

            if (applyPaging &&
                specification.IsPagingEnabled)
            {
                query = query
                    .Skip(specification.Skip)
                    .Take(specification.Take);
            }

            if (specification.AsNoTracking)
            {
                query = query.AsNoTracking();
            }

            if (specification.AsSplitQuery &&
                applyIncludes)
            {
                query = query.AsSplitQuery();
            }

            return query;
        }
    }
}
