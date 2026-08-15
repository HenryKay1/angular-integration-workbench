using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Domain.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Tests;

public sealed class MilestoneTwoModelSmokeTests
{
    [Fact]
    public async Task CompanyCanContainLocationsAcrossRegions()
    {
        await WithContextAsync(async context =>
        {
            var company = await context.Companies
                .Include(item => item.Locations)
                .ThenInclude(location => location.Region)
                .SingleAsync(item => item.Code == "WORKBENCH");

            Assert.Equal(2, company.Locations.Count);
            Assert.Equal(["Southeast", "Southwest"], company.Locations.Select(location => location.Region.Name).Order());
        });
    }

    [Fact]
    public async Task MultipleCompaniesCanShareARegion()
    {
        await WithContextAsync(async context =>
        {
            var region = await context.Regions
                .Include(item => item.Locations)
                .ThenInclude(location => location.Company)
                .SingleAsync(item => item.Code == "SW");

            Assert.Contains(region.Locations, location => location.Company.Name == "Workbench Industries");
            Assert.Contains(region.Locations, location => location.Company.Name == "ABC Mechanical");
        });
    }

    [Fact]
    public async Task LocationLoadsCompanyRegionAndAddress()
    {
        await WithContextAsync(async context =>
        {
            var location = await context.Locations
                .Include(item => item.Company)
                .Include(item => item.Region)
                .Include(item => item.Address)
                .ThenInclude(address => address.City)
                .SingleAsync(item => item.Code == "DAL-HQ");

            Assert.Equal("Workbench Industries", location.Company.Name);
            Assert.Equal("Southwest", location.Region.Name);
            Assert.Equal("Dallas", location.Address.City!.Name);
        });
    }

    [Fact]
    public async Task AppUserBelongsToCompanyAndCanDeriveRegionThroughPrimaryLocation()
    {
        await WithContextAsync(async context =>
        {
            var user = await context.AppUsers
                .Include(item => item.Company)
                .Include(item => item.Location!)
                .ThenInclude(location => location.Region)
                .SingleAsync(item => item.Email == "avery.morgan@example.com");

            Assert.Equal("Workbench Industries", user.Company.Name);
            Assert.Equal("Dallas Headquarters", user.Location!.Name);
            Assert.Equal("Southwest", user.Location.Region.Name);
        });
    }

    [Fact]
    public async Task RoleScopeValidationAllowsCompatibleCompanyRoles()
    {
        await WithContextAsync(async context =>
        {
            var internalUser = await context.AppUsers
                .Include(item => item.Company)
                .SingleAsync(item => item.Email == "avery.morgan@example.com");
            var internalRole = await context.Roles.Include(item => item.CompanyScope).SingleAsync(item => item.Name == "Engineer");
            var viewerRole = await context.Roles.Include(item => item.CompanyScope).SingleAsync(item => item.Name == "Viewer");

            var externalUser = new AppUser
            {
                FirstName = "Jordan",
                LastName = "Lee",
                Email = "jordan.lee@example.com",
                Company = await context.Companies.SingleAsync(item => item.Code == "ABC-MECH"),
                CreatedUtc = new DateTime(2026, 08, 15, 12, 0, 0, DateTimeKind.Utc)
            };
            var externalRole = await context.Roles.Include(item => item.CompanyScope).SingleAsync(item => item.Name == "Customer User");

            Assert.True(RoleAssignmentValidator.CanAssignRole(internalUser, internalRole));
            Assert.True(RoleAssignmentValidator.CanAssignRole(internalUser, viewerRole));
            Assert.True(RoleAssignmentValidator.CanAssignRole(externalUser, externalRole));
            Assert.True(RoleAssignmentValidator.CanAssignRole(externalUser, viewerRole));
        });
    }

    [Fact]
    public async Task RoleScopeValidationRejectsIncompatibleCompanyRoles()
    {
        await WithContextAsync(async context =>
        {
            var externalUser = new AppUser
            {
                FirstName = "Jordan",
                LastName = "Lee",
                Email = "jordan.lee@example.com",
                Company = await context.Companies.SingleAsync(item => item.Code == "ABC-MECH"),
                CreatedUtc = new DateTime(2026, 08, 15, 12, 0, 0, DateTimeKind.Utc)
            };
            var internalRole = await context.Roles.Include(item => item.CompanyScope).SingleAsync(item => item.Name == "Engineer");

            Assert.False(RoleAssignmentValidator.CanAssignRole(externalUser, internalRole));
            Assert.Throws<InvalidOperationException>(() => RoleAssignmentValidator.ValidateCanAssignRole(externalUser, internalRole));
        });
    }

    [Fact]
    public async Task UserCanHoldMultipleRolesAndDeriveEffectivePermissions()
    {
        await WithContextAsync(async context =>
        {
            var user = await context.AppUsers
                .Include(item => item.UserRoles)
                .ThenInclude(userRole => userRole.Role)
                .ThenInclude(role => role.RolePermissions)
                .ThenInclude(rolePermission => rolePermission.Permission)
                .SingleAsync(item => item.Email == "avery.morgan@example.com");

            Assert.Equal(["Administrator", "Engineer"], user.UserRoles.Select(userRole => userRole.Role.Name).Distinct().Order());

            var permissionCodes = user.UserRoles
                .SelectMany(userRole => userRole.Role.RolePermissions)
                .Select(rolePermission => rolePermission.Permission.Code)
                .Distinct()
                .Order()
                .ToArray();

            Assert.Contains("Project.View", permissionCodes);
            Assert.Contains("LineItem.Configure", permissionCodes);
            Assert.Contains("User.Manage", permissionCodes);
        });
    }

    [Fact]
    public async Task PermissionCodeUniquenessIsEnforced()
    {
        await WithContextAsync(async context =>
        {
            context.Permissions.Add(new Permission { Code = "Project.View", Name = "Duplicate project view" });

            await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        });
    }

    [Fact]
    public void ModelAvoidsDeferredOrAmbiguousOrganizationReferences()
    {
        Assert.DoesNotContain(typeof(Company).GetProperties(), property => property.Name == "RegionId");
        Assert.DoesNotContain(typeof(AppUser).GetProperties(), property => property.Name == "RegionId");
        Assert.DoesNotContain(typeof(AppUser).GetProperties(), property => property.Name == "PermissionId");
    }

    [Fact]
    public async Task MilestoneOneProjectHierarchyStillWorks()
    {
        await WithContextAsync(async context =>
        {
            var project = await context.Projects
                .Include(item => item.CreatedByUser)
                .ThenInclude(user => user.Company)
                .Include(item => item.Schedules)
                .ThenInclude(schedule => schedule.LineItems)
                .SingleAsync(item => item.ProjectNumber == "NC-2026-014");

            Assert.Equal("Workbench Industries", project.CreatedByUser.Company.Name);
            Assert.Equal("RTU-1", Assert.Single(Assert.Single(project.Schedules).LineItems).Tag);
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
