using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.Entities.Reference.Enums;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Reference.Interfaces;
using AngularWorkbench.Api.Repositories.Specifications.Interfaces;
using AngularWorkbench.Api.Services.Access;

namespace AngularWorkbench.Api.Tests;

public sealed class RoleValidationTests
{
    [Fact]
    public async Task RoleNameIsUniqueRejectsExistingRoleName()
    {
        var service = CreateService();

        var isUnique = await service.RoleNameIsUniqueAsync("Administrator");

        Assert.False(isUnique);
    }

    [Fact]
    public async Task RoleNameIsUniqueAllowsNewRoleName()
    {
        var service = CreateService();

        var isUnique = await service.RoleNameIsUniqueAsync("Dispatch Manager");

        Assert.True(isUnique);
    }

    [Fact]
    public async Task RoleNameIsUniqueAllowsCurrentRoleNameForEdits()
    {
        var service = CreateService();

        var isUnique = await service.RoleNameIsUniqueAsync(
            "Administrator",
            roleId: 1);

        Assert.True(isUnique);
    }

    [Fact]
    public async Task ValidateRoleNameReturnsValidationResult()
    {
        var service = CreateService();

        var result = await service.ValidateRoleNameAsync(
            new RoleNameValidationRequest
            {
                Name = "Administrator"
            });

        Assert.False(result.IsValid);
        Assert.Equal("Role name must be unique.", result.Message);
    }

    private static RoleService CreateService()
    {
        return new RoleService(
            new FakeRoleRepository(
            [
                new Role { RoleId = 1, Name = "Administrator" },
                new Role { RoleId = 2, Name = "Engineer" }
            ]),
            new FakePermissionRepository(),
            new FakeLookupRepository(),
            new FakeUnitOfWork());
    }

    private abstract class FakeRepository<TEntity> : IRepositoryBase<TEntity>
        where TEntity : class
    {
        protected readonly List<TEntity> Items;

        protected FakeRepository(IEnumerable<TEntity>? items = null)
        {
            Items = items?.ToList() ?? [];
        }

        public Task<int> CountAsync(
            ISpecification<TEntity> specification,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(ApplyFilters(specification).Count());
        }

        public Task<TEntity?> FirstOrDefaultAsync(
            ISpecification<TEntity> specification,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(ApplyFilters(specification).FirstOrDefault());
        }

        public Task<IReadOnlyList<TEntity>> ListAsync(
            ISpecification<TEntity> specification,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<TEntity>>(ApplyFilters(specification).ToList());
        }

        public Task<IReadOnlyList<TResult>> ListAsync<TResult>(
            IProjectionSpecification<TEntity, TResult> specification,
            CancellationToken cancellationToken = default)
        {
            var selector = specification.Selector.Compile();
            var results = ApplyFilters(specification).Select(selector).ToList();

            return Task.FromResult<IReadOnlyList<TResult>>(results);
        }

        public Task<TResult?> FirstOrDefaultAsync<TResult>(
            IProjectionSpecification<TEntity, TResult> specification,
            CancellationToken cancellationToken = default)
        {
            var selector = specification.Selector.Compile();
            var result = ApplyFilters(specification).Select(selector).FirstOrDefault();

            return Task.FromResult(result);
        }

        public Task AddAsync(
            TEntity entity,
            CancellationToken cancellationToken = default)
        {
            Items.Add(entity);

            return Task.CompletedTask;
        }

        public void Update(TEntity entity)
        {
        }

        public void Delete(TEntity entity)
        {
            Items.Remove(entity);
        }

        private IEnumerable<TEntity> ApplyFilters(ISpecification<TEntity> specification)
        {
            return specification.Filters.Aggregate(
                Items.AsEnumerable(),
                (current, filter) => current.Where(filter.Compile()));
        }
    }

    private sealed class FakeRoleRepository(IEnumerable<Role> roles)
        : FakeRepository<Role>(roles),
          IRoleRepository
    {
        public Task<Role?> GetByIdAsync(
            int roleId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.FirstOrDefault(role => role.RoleId == roleId));
        }

        public Task<Role?> GetByNameAsync(
            string name,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.FirstOrDefault(role => role.Name == name));
        }

        public Task<IReadOnlyList<Role>> GetActiveAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<Role>>(Items.Where(role => role.IsActive).ToList());
        }
    }

    private sealed class FakePermissionRepository
        : FakeRepository<Permission>,
          IPermissionRepository
    {
        public Task<Permission?> GetByIdAsync(
            int permissionId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.FirstOrDefault(permission => permission.PermissionId == permissionId));
        }

        public Task<Permission?> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.FirstOrDefault(permission => permission.Code == code));
        }

        public Task<IReadOnlyList<Permission>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<Permission>>(Items);
        }
    }

    private sealed class FakeLookupRepository
        : FakeRepository<Lookup>,
          ILookupRepository
    {
        public Task<Lookup?> GetByIdAsync(
            int lookupId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.FirstOrDefault(lookup => lookup.LookupId == lookupId));
        }

        public Task<IReadOnlyList<Lookup>> GetByCategoryAsync(
            LookupCategoryEnum category,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<Lookup>>([]);
        }

        public Task<Lookup?> GetByValueAsync(
            LookupCategoryEnum category,
            int value,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<Lookup?>(null);
        }

        public Task<Lookup?> GetByCodeAsync(
            LookupCategoryEnum category,
            string code,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<Lookup?>(null);
        }
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(0);
        }
    }
}
