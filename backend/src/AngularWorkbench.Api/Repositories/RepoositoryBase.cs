using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications;
using AngularWorkbench.Api.Repositories.Specifications.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Repositories;

public abstract class RepositoryBase<TEntity>
    : IRepositoryBase<TEntity>
    where TEntity : class
{
    protected readonly AppDbContext Context;
    protected readonly DbSet<TEntity> DbSet;

    protected RepositoryBase(AppDbContext context)
    {
        Context = context;
        DbSet = context.Set<TEntity>();
    }
    public async Task AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(entity, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
    }

    public void Update(TEntity entity)
    {
        DbSet.Update(entity);
    }

    public void Delete(TEntity entity)
    {
        DbSet.Remove(entity);
    }

    public async Task<IReadOnlyList<TEntity>> ListAsync(
        ISpecification<TEntity> specification,
        CancellationToken cancellationToken = default)
    {
        var query = SpecificationEvaluator.GetQuery(
            DbSet,
            specification);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<TEntity?> FirstOrDefaultAsync(
        ISpecification<TEntity> specification,
        CancellationToken cancellationToken = default)
    {
        var query = SpecificationEvaluator.GetQuery(
            DbSet,
            specification);

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TResult>> ListAsync<TResult>(
        IProjectionSpecification<TEntity, TResult> specification,
        CancellationToken cancellationToken = default)
    {
        var query = SpecificationEvaluator.GetQuery(
            DbSet,
            specification,
            applyIncludes: false);

        return await query
            .Select(specification.Selector)
            .ToListAsync(cancellationToken);
    }

    public async Task<TResult?> FirstOrDefaultAsync<TResult>(
        IProjectionSpecification<TEntity, TResult> specification,
        CancellationToken cancellationToken = default)
    {
        var query = SpecificationEvaluator.GetQuery(
            DbSet,
            specification,
            applyIncludes: false);

        return await query
            .Select(specification.Selector)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> CountAsync(
        ISpecification<TEntity> specification,
        CancellationToken cancellationToken = default)
    {
        var query = SpecificationEvaluator.GetQuery(
            DbSet,
            specification,
            applyIncludes: false,
            applyOrdering: false,
            applyPaging: false);

        return await query.CountAsync(cancellationToken);
    }



}