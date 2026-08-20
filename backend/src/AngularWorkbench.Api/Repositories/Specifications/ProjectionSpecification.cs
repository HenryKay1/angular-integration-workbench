using AngularWorkbench.Api.Repositories.Specifications.Interfaces;
using System.Linq.Expressions;

namespace AngularWorkbench.Api.Repositories.Specifications
{
    public abstract class ProjectionSpecification<TEntity, TResult>
     : Specification<TEntity>,
       IProjectionSpecification<TEntity, TResult>
    {
        public Expression<Func<TEntity, TResult>> Selector
        {
            get;
            private set;
        } = default!;

        protected void SetSelector(
            Expression<Func<TEntity, TResult>> selector)
        {
            Selector = selector;
        }
    }
}
