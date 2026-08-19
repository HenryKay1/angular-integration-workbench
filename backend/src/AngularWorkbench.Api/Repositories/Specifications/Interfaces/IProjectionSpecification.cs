using System.Linq.Expressions;

namespace AngularWorkbench.Api.Repositories.Specifications.Interfaces
{
    public interface IProjectionSpecification<TEntity, TResult>
        : ISpecification<TEntity>
    {
        Expression<Func<TEntity, TResult>> Selector { get; }
    }
}
