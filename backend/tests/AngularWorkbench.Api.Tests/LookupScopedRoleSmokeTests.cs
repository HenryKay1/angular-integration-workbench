using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Domain.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Tests;

public sealed class LookupScopedRoleSmokeTests
{
    [Fact]
    public async Task LookupCategoryCanContainMultipleLookups()
    {
        await WithContextAsync(async context =>
        {
            var category = await context.LookupCategories
                .Include(item => item.Lookups)
                .SingleAsync(item => item.Code == "ACCESS_SCOPE");

            Assert.Equal(["COMPANY", "GLOBAL", "REGION"], category.Lookups.Select(item => item.Code).OrderBy(item => item));
        });
    }

    [Fact]
    public async Task LookupCanReferenceParentLookupForGeographyHierarchy()
    {
        await WithContextAsync(async context =>
        {
            var city = await context.Lookups
                .Include(item => item.ParentLookup!)
                .ThenInclude(item => item.ParentLookup)
                .SingleAsync(item => item.Code == "DALLAS");

            Assert.Equal("Texas", city.ParentLookup!.Name);
            Assert.Equal("United States", city.ParentLookup.ParentLookup!.Name);
        });
    }

    [Fact]
    public async Task RequiredLookupScopesAreSeeded()
    {
        await WithContextAsync(async context =>
        {
            var accessScopes = await context.Lookups
                .Where(item => item.LookupCategory.Code == "ACCESS_SCOPE")
                .Select(item => item.Code)
                .OrderBy(item => item)
                .ToArrayAsync();

            var companyScopes = await context.Lookups
                .Where(item => item.LookupCategory.Code == "COMPANY_SCOPE")
                .Select(item => item.Code)
                .OrderBy(item => item)
                .ToArrayAsync();

            Assert.Equal(["COMPANY", "GLOBAL", "REGION"], accessScopes);
            Assert.Equal(["BOTH", "EXTERNAL", "INTERNAL"], companyScopes);
        });
    }

    [Fact]
    public async Task RoleReferencesCompanyScopeLookupAndHasAllPermissionsFlag()
    {
        await WithContextAsync(async context =>
        {
            var administrator = await context.Roles
                .Include(item => item.CompanyScope)
                .SingleAsync(item => item.Name == "Administrator");

            var engineer = await context.Roles
                .Include(item => item.CompanyScope)
                .SingleAsync(item => item.Name == "Engineer");

            Assert.Equal("INTERNAL", administrator.CompanyScope.Code);
            Assert.True(administrator.HasAllPermissions);
            Assert.Equal("INTERNAL", engineer.CompanyScope.Code);
            Assert.False(engineer.HasAllPermissions);
        });
    }

    [Fact]
    public async Task CompanyScopeValidationAllowsCompatibleAssignmentsAndRejectsInvalidOnes()
    {
        await WithContextAsync(async context =>
        {
            var internalUser = await context.AppUsers
                .Include(item => item.Company)
                .SingleAsync(item => item.Email == "avery.morgan@example.com");
            var externalUser = new AppUser
            {
                FirstName = "Mina",
                LastName = "Patel",
                Email = "mina.patel@example.com",
                Company = await context.Companies.SingleAsync(item => item.Code == "ABC-MECH"),
                CreatedUtc = new DateTime(2026, 08, 15, 12, 0, 0, DateTimeKind.Utc)
            };

            var internalRole = await context.Roles.Include(item => item.CompanyScope).SingleAsync(item => item.Name == "Engineer");
            var externalRole = await context.Roles.Include(item => item.CompanyScope).SingleAsync(item => item.Name == "Customer User");
            var bothRole = await context.Roles.Include(item => item.CompanyScope).SingleAsync(item => item.Name == "Viewer");

            Assert.True(RoleAssignmentValidator.CanAssignRole(internalUser, internalRole));
            Assert.True(RoleAssignmentValidator.CanAssignRole(internalUser, bothRole));
            Assert.False(RoleAssignmentValidator.CanAssignRole(internalUser, externalRole));

            Assert.True(RoleAssignmentValidator.CanAssignRole(externalUser, externalRole));
            Assert.True(RoleAssignmentValidator.CanAssignRole(externalUser, bothRole));
            Assert.False(RoleAssignmentValidator.CanAssignRole(externalUser, internalRole));
        });
    }

    [Fact]
    public async Task AppUserRoleUsesSurrogatePrimaryKey()
    {
        await WithContextAsync(async context =>
        {
            var primaryKey = context.Model.FindEntityType(typeof(AppUserRole))!.FindPrimaryKey()!;

            Assert.Equal(["AppUserRoleId"], primaryKey.Properties.Select(property => property.Name));
        });
    }

    [Fact]
    public async Task SameUserCanReceiveSameRoleUnderMultipleScopes()
    {
        await WithContextAsync(async context =>
        {
            var assignments = await context.AppUserRoles
                .Include(item => item.Role)
                .Include(item => item.AccessScope)
                .Where(item => item.AppUser.Email == "avery.morgan@example.com" && item.Role.Name == "Engineer")
                .ToArrayAsync();

            Assert.Equal(2, assignments.Length);
            Assert.All(assignments, assignment => Assert.Equal("REGION", assignment.AccessScope.Code));
            Assert.Equal([1, 2], assignments.Select(assignment => assignment.RegionId!.Value).OrderBy(item => item));
        });
    }

    [Fact]
    public async Task AccessScopeValidationAcceptsValidGlobalCompanyAndRegionTargets()
    {
        await WithContextAsync(async context =>
        {
            var globalAssignment = await context.AppUserRoles
                .Include(item => item.AccessScope)
                .ThenInclude(scope => scope.LookupCategory)
                .SingleAsync(item => item.AppUserRoleId == 1);
            var companyScope = await context.Lookups
                .Include(item => item.LookupCategory)
                .SingleAsync(item => item.LookupCategory.Code == "ACCESS_SCOPE" && item.Code == "COMPANY");
            var regionAssignment = await context.AppUserRoles
                .Include(item => item.AccessScope)
                .ThenInclude(scope => scope.LookupCategory)
                .SingleAsync(item => item.AppUserRoleId == 2);

            var companyAssignment = new AppUserRole
            {
                AppUserId = 1,
                RoleId = 7,
                AccessScope = companyScope,
                AccessScopeLookupId = companyScope.LookupId,
                CompanyId = 1
            };

            RoleAssignmentValidator.ValidateAccessScope(globalAssignment);
            RoleAssignmentValidator.ValidateAccessScope(companyAssignment);
            RoleAssignmentValidator.ValidateAccessScope(regionAssignment);
        });
    }

    [Fact]
    public async Task AccessScopeValidationRejectsAmbiguousOrMissingTargets()
    {
        await WithContextAsync(async context =>
        {
            var companyScope = await context.Lookups
                .Include(item => item.LookupCategory)
                .SingleAsync(item => item.LookupCategory.Code == "ACCESS_SCOPE" && item.Code == "COMPANY");
            var regionScope = await context.Lookups
                .Include(item => item.LookupCategory)
                .SingleAsync(item => item.LookupCategory.Code == "ACCESS_SCOPE" && item.Code == "REGION");

            var missingCompany = new AppUserRole { AccessScope = companyScope, AccessScopeLookupId = companyScope.LookupId };
            var ambiguousRegion = new AppUserRole { AccessScope = regionScope, AccessScopeLookupId = regionScope.LookupId, CompanyId = 1, RegionId = 1 };

            Assert.Throws<InvalidOperationException>(() => RoleAssignmentValidator.ValidateAccessScope(missingCompany));
            Assert.Throws<InvalidOperationException>(() => RoleAssignmentValidator.ValidateAccessScope(ambiguousRegion));
        });
    }

    [Fact]
    public async Task AddressCanReferenceCountryStateAndCityLookups()
    {
        await WithContextAsync(async context =>
        {
            var address = await context.Addresses
                .Include(item => item.Country)
                .Include(item => item.State)
                .Include(item => item.City)
                .SingleAsync(item => item.AddressLine1 == "123 Example Rd");

            Assert.Equal("United States", address.Country!.Name);
            Assert.Equal("Texas", address.State!.Name);
            Assert.Equal("Dallas", address.City!.Name);
        });
    }

    [Fact]
    public async Task ExistingRolePermissionBehaviorRemainsIntact()
    {
        await WithContextAsync(async context =>
        {
            var engineer = await context.Roles
                .Include(item => item.RolePermissions)
                .ThenInclude(item => item.Permission)
                .SingleAsync(item => item.Name == "Engineer");

            Assert.False(engineer.HasAllPermissions);
            Assert.Contains(engineer.RolePermissions, item => item.Permission.Code == "LineItem.Configure");
            Assert.Contains(engineer.RolePermissions, item => item.Permission.Code == "Product.View");
        });
    }

    private static async Task WithContextAsync(Func<AppDbContext, Task> assertion)
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var context = new AppDbContext(options);
        await context.Database.EnsureCreatedAsync();

        await assertion(context);
    }
}
