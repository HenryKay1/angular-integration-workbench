using AngularWorkbench.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Data;

public static class MilestoneTwoSeedData
{
    public static void SeedMilestoneTwoData(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LookupCategory>().HasData(
            new LookupCategory { LookupCategoryId = 1, Name = "Access Scope", Code = "ACCESS_SCOPE", IsActive = true },
            new LookupCategory { LookupCategoryId = 2, Name = "Company Scope", Code = "COMPANY_SCOPE", IsActive = true },
            new LookupCategory { LookupCategoryId = 3, Name = "Country", Code = "COUNTRY", IsActive = true },
            new LookupCategory { LookupCategoryId = 4, Name = "State", Code = "STATE", IsActive = true },
            new LookupCategory { LookupCategoryId = 5, Name = "City", Code = "CITY", IsActive = true });

        modelBuilder.Entity<Lookup>().HasData(
            new Lookup { LookupId = 1, LookupCategoryId = 1, Name = "Global", Code = "GLOBAL", SortOrder = 10, IsActive = true },
            new Lookup { LookupId = 2, LookupCategoryId = 1, Name = "Company", Code = "COMPANY", SortOrder = 20, IsActive = true },
            new Lookup { LookupId = 3, LookupCategoryId = 1, Name = "Region", Code = "REGION", SortOrder = 30, IsActive = true },
            new Lookup { LookupId = 4, LookupCategoryId = 2, Name = "Internal", Code = "INTERNAL", SortOrder = 10, IsActive = true },
            new Lookup { LookupId = 5, LookupCategoryId = 2, Name = "External", Code = "EXTERNAL", SortOrder = 20, IsActive = true },
            new Lookup { LookupId = 6, LookupCategoryId = 2, Name = "Both", Code = "BOTH", SortOrder = 30, IsActive = true },
            new Lookup { LookupId = 7, LookupCategoryId = 3, Name = "United States", Code = "US", SortOrder = 10, IsActive = true },
            new Lookup { LookupId = 8, LookupCategoryId = 4, ParentLookupId = 7, Name = "Texas", Code = "TX", SortOrder = 10, IsActive = true },
            new Lookup { LookupId = 9, LookupCategoryId = 4, ParentLookupId = 7, Name = "Georgia", Code = "GA", SortOrder = 20, IsActive = true },
            new Lookup { LookupId = 10, LookupCategoryId = 5, ParentLookupId = 8, Name = "Dallas", Code = "DALLAS", SortOrder = 10, IsActive = true },
            new Lookup { LookupId = 11, LookupCategoryId = 5, ParentLookupId = 8, Name = "Garland", Code = "GARLAND", SortOrder = 20, IsActive = true },
            new Lookup { LookupId = 12, LookupCategoryId = 5, ParentLookupId = 8, Name = "Fort Worth", Code = "FORT_WORTH", SortOrder = 30, IsActive = true },
            new Lookup { LookupId = 13, LookupCategoryId = 5, ParentLookupId = 9, Name = "Atlanta", Code = "ATLANTA", SortOrder = 10, IsActive = true });

        modelBuilder.Entity<Region>().HasData(
            new Region { RegionId = 1, Name = "Southwest", Code = "SW", IsActive = true },
            new Region { RegionId = 2, Name = "Southeast", Code = "SE", IsActive = true },
            new Region { RegionId = 3, Name = "Northeast", Code = "NE", IsActive = true },
            new Region { RegionId = 4, Name = "West", Code = "W", IsActive = true });

        modelBuilder.Entity<Company>().HasData(
            new Company { CompanyId = 1, Name = "Workbench Industries", Code = "WORKBENCH", IsInternal = true, IsActive = true },
            new Company { CompanyId = 2, Name = "ABC Mechanical", Code = "ABC-MECH", IsInternal = false, IsActive = true });

        modelBuilder.Entity<Address>().HasData(
            new Address
            {
                AddressId = 1,
                AddressLine1 = "123 Example Rd",
                PostalCode = "75001",
                CountryLookupId = 7,
                StateLookupId = 8,
                CityLookupId = 10
            },
            new Address
            {
                AddressId = 2,
                AddressLine1 = "456 Peachtree St",
                PostalCode = "30303",
                CountryLookupId = 7,
                StateLookupId = 9,
                CityLookupId = 13
            },
            new Address
            {
                AddressId = 3,
                AddressLine1 = "789 Mechanical Way",
                PostalCode = "76102",
                CountryLookupId = 7,
                StateLookupId = 8,
                CityLookupId = 12
            });

        modelBuilder.Entity<Location>().HasData(
            new Location { LocationId = 1, CompanyId = 1, RegionId = 1, AddressId = 1, Name = "Dallas Headquarters", Code = "DAL-HQ", IsActive = true },
            new Location { LocationId = 2, CompanyId = 1, RegionId = 2, AddressId = 2, Name = "Atlanta Office", Code = "ATL", IsActive = true },
            new Location { LocationId = 3, CompanyId = 2, RegionId = 1, AddressId = 3, Name = "Fort Worth Office", Code = "FTW", IsActive = true });

        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, Name = "Administrator", Description = "Full internal administrative access.", CompanyScopeLookupId = 4, HasAllPermissions = true, IsActive = true },
            new Role { RoleId = 2, Name = "Engineer", Description = "Internal engineering and configuration access.", CompanyScopeLookupId = 4, HasAllPermissions = false, IsActive = true },
            new Role { RoleId = 3, Name = "Sales", Description = "Internal sales access.", CompanyScopeLookupId = 4, HasAllPermissions = false, IsActive = true },
            new Role { RoleId = 4, Name = "Project Manager", Description = "Internal project coordination access.", CompanyScopeLookupId = 4, HasAllPermissions = false, IsActive = true },
            new Role { RoleId = 5, Name = "Customer Admin", Description = "External customer administration access.", CompanyScopeLookupId = 5, HasAllPermissions = false, IsActive = true },
            new Role { RoleId = 6, Name = "Customer User", Description = "External customer project access.", CompanyScopeLookupId = 5, HasAllPermissions = false, IsActive = true },
            new Role { RoleId = 7, Name = "Viewer", Description = "Read-focused access shared across company types.", CompanyScopeLookupId = 6, HasAllPermissions = false, IsActive = true });

        modelBuilder.Entity<Permission>().HasData(
            new Permission { PermissionId = 1, Code = "Project.View", Name = "View projects" },
            new Permission { PermissionId = 2, Code = "Project.Create", Name = "Create projects" },
            new Permission { PermissionId = 3, Code = "Project.Edit", Name = "Edit projects" },
            new Permission { PermissionId = 4, Code = "Project.Delete", Name = "Delete projects" },
            new Permission { PermissionId = 5, Code = "Schedule.View", Name = "View schedules" },
            new Permission { PermissionId = 6, Code = "Schedule.Create", Name = "Create schedules" },
            new Permission { PermissionId = 7, Code = "Schedule.Edit", Name = "Edit schedules" },
            new Permission { PermissionId = 8, Code = "LineItem.View", Name = "View line items" },
            new Permission { PermissionId = 9, Code = "LineItem.Create", Name = "Create line items" },
            new Permission { PermissionId = 10, Code = "LineItem.Edit", Name = "Edit line items" },
            new Permission { PermissionId = 11, Code = "LineItem.Configure", Name = "Configure line items" },
            new Permission { PermissionId = 12, Code = "Product.View", Name = "View products" },
            new Permission { PermissionId = 13, Code = "Product.Manage", Name = "Manage products" },
            new Permission { PermissionId = 14, Code = "User.View", Name = "View users" },
            new Permission { PermissionId = 15, Code = "User.Manage", Name = "Manage users" });

        modelBuilder.Entity<AppUserRole>().HasData(
            new AppUserRole { AppUserRoleId = 1, AppUserId = 1, RoleId = 1, AccessScopeLookupId = 1 },
            new AppUserRole { AppUserRoleId = 2, AppUserId = 1, RoleId = 2, AccessScopeLookupId = 3, RegionId = 1 },
            new AppUserRole { AppUserRoleId = 3, AppUserId = 1, RoleId = 2, AccessScopeLookupId = 3, RegionId = 2 });

        modelBuilder.Entity<RolePermission>().HasData(
            new RolePermission { RoleId = 1, PermissionId = 1 },
            new RolePermission { RoleId = 1, PermissionId = 2 },
            new RolePermission { RoleId = 1, PermissionId = 3 },
            new RolePermission { RoleId = 1, PermissionId = 4 },
            new RolePermission { RoleId = 1, PermissionId = 5 },
            new RolePermission { RoleId = 1, PermissionId = 6 },
            new RolePermission { RoleId = 1, PermissionId = 7 },
            new RolePermission { RoleId = 1, PermissionId = 8 },
            new RolePermission { RoleId = 1, PermissionId = 9 },
            new RolePermission { RoleId = 1, PermissionId = 10 },
            new RolePermission { RoleId = 1, PermissionId = 11 },
            new RolePermission { RoleId = 1, PermissionId = 12 },
            new RolePermission { RoleId = 1, PermissionId = 13 },
            new RolePermission { RoleId = 1, PermissionId = 14 },
            new RolePermission { RoleId = 1, PermissionId = 15 },
            new RolePermission { RoleId = 2, PermissionId = 1 },
            new RolePermission { RoleId = 2, PermissionId = 3 },
            new RolePermission { RoleId = 2, PermissionId = 5 },
            new RolePermission { RoleId = 2, PermissionId = 7 },
            new RolePermission { RoleId = 2, PermissionId = 8 },
            new RolePermission { RoleId = 2, PermissionId = 10 },
            new RolePermission { RoleId = 2, PermissionId = 11 },
            new RolePermission { RoleId = 2, PermissionId = 12 },
            new RolePermission { RoleId = 3, PermissionId = 1 },
            new RolePermission { RoleId = 3, PermissionId = 2 },
            new RolePermission { RoleId = 3, PermissionId = 3 },
            new RolePermission { RoleId = 3, PermissionId = 5 },
            new RolePermission { RoleId = 3, PermissionId = 8 },
            new RolePermission { RoleId = 3, PermissionId = 12 },
            new RolePermission { RoleId = 4, PermissionId = 1 },
            new RolePermission { RoleId = 4, PermissionId = 2 },
            new RolePermission { RoleId = 4, PermissionId = 3 },
            new RolePermission { RoleId = 4, PermissionId = 5 },
            new RolePermission { RoleId = 4, PermissionId = 6 },
            new RolePermission { RoleId = 4, PermissionId = 7 },
            new RolePermission { RoleId = 4, PermissionId = 8 },
            new RolePermission { RoleId = 4, PermissionId = 9 },
            new RolePermission { RoleId = 4, PermissionId = 10 },
            new RolePermission { RoleId = 4, PermissionId = 12 },
            new RolePermission { RoleId = 5, PermissionId = 1 },
            new RolePermission { RoleId = 5, PermissionId = 2 },
            new RolePermission { RoleId = 5, PermissionId = 3 },
            new RolePermission { RoleId = 5, PermissionId = 5 },
            new RolePermission { RoleId = 5, PermissionId = 8 },
            new RolePermission { RoleId = 5, PermissionId = 14 },
            new RolePermission { RoleId = 6, PermissionId = 1 },
            new RolePermission { RoleId = 6, PermissionId = 5 },
            new RolePermission { RoleId = 6, PermissionId = 8 },
            new RolePermission { RoleId = 7, PermissionId = 1 },
            new RolePermission { RoleId = 7, PermissionId = 5 },
            new RolePermission { RoleId = 7, PermissionId = 8 },
            new RolePermission { RoleId = 7, PermissionId = 12 });
    }
}
