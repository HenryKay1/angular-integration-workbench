using AngularWorkbench.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<AppUserRole> AppUserRoles => Set<AppUserRole>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Lookup> Lookups => Set<Lookup>();
    public DbSet<LookupCategory> LookupCategories => Set<LookupCategory>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<LineItem> LineItems => Set<LineItem>();
    public DbSet<ProductType> ProductTypes => Set<ProductType>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductModel> ProductModels => Set<ProductModel>();
    public DbSet<ProductOptionGroup> ProductOptionGroups => Set<ProductOptionGroup>();
    public DbSet<ProductOption> ProductOptions => Set<ProductOption>();
    public DbSet<LineItemSelection> LineItemSelections => Set<LineItemSelection>();
    public DbSet<Country> Countries { get; set; }
    public DbSet<State> States { get; set; }
    public DbSet<City> Cities { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasKey(user => user.AppUserId);
            entity.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.LastName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.Email).HasMaxLength(320).IsRequired();
            entity.HasIndex(user => user.Email).IsUnique();
            entity.HasOne(user => user.Company)
                .WithMany(company => company.AppUsers)
                .HasForeignKey(user => user.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(user => user.Location)
                .WithMany(location => location.AppUsers)
                .HasForeignKey(user => user.LocationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(address => address.AddressId);
            entity.Property(address => address.AddressLine1).HasMaxLength(200);
            entity.Property(address => address.AddressLine2).HasMaxLength(200);
            entity.Property(address => address.PostalCode).HasMaxLength(20);
     
            // NEW geography relationships
            entity.HasOne(address => address.Country)
                .WithMany()
                .HasForeignKey(address => address.CountryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(address => address.State)
                .WithMany()
                .HasForeignKey(address => address.StateId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(address => address.City)
                .WithMany()
                .HasForeignKey(address => address.CityId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Country>(entity =>
        {
            entity.HasKey(country => country.CountryId);

            entity.Property(country => country.Name)
                .IsRequired();

            entity.Property(country => country.Code)
                .IsRequired();

            entity.HasIndex(country => country.Code)
                .IsUnique();

            entity.HasMany(country => country.States)
                .WithOne(state => state.Country)
                .HasForeignKey(state => state.CountryId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<State>(entity =>
        {
            entity.HasKey(state => state.StateId);

            entity.Property(state => state.Name)
                .IsRequired();

            entity.Property(state => state.Code)
                .IsRequired();

            entity.HasIndex(state => new
            {
                state.CountryId,
                state.Code
            })
            .IsUnique();

            entity.HasMany(state => state.Cities)
                .WithOne(city => city.State)
                .HasForeignKey(city => city.StateId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<City>(entity =>
        {
            entity.HasKey(city => city.CityId);

            entity.Property(city => city.Name)
                .IsRequired();

            entity.Property(city => city.Code)
                .IsRequired();

            entity.HasIndex(city => new
            {
                city.StateId,
                city.Code
            })
            .IsUnique();
        });

        modelBuilder.Entity<AppUserRole>(entity =>
        {
            entity.HasKey(userRole => userRole.AppUserRoleId);
            entity.HasOne(userRole => userRole.AppUser)
                .WithMany(user => user.UserRoles)
                .HasForeignKey(userRole => userRole.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(userRole => userRole.Role)
                .WithMany(role => role.UserRoles)
                .HasForeignKey(userRole => userRole.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(userRole => userRole.AccessScope)
                .WithMany(lookup => lookup.AccessScopeUserRoles)
                .HasForeignKey(userRole => userRole.AccessScopeLookupId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(userRole => userRole.Company)
                .WithMany()
                .HasForeignKey(userRole => userRole.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(userRole => userRole.Region)
                .WithMany()
                .HasForeignKey(userRole => userRole.RegionId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(userRole => userRole.AppUserId);
            entity.HasIndex(userRole => userRole.RoleId);
            entity.HasIndex(userRole => userRole.AccessScopeLookupId);
            entity.HasIndex(userRole => userRole.CompanyId);
            entity.HasIndex(userRole => userRole.RegionId);
        });

        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasKey(company => company.CompanyId);
            entity.Property(company => company.Name).HasMaxLength(200).IsRequired();
            entity.Property(company => company.Code).HasMaxLength(50);
            entity.HasIndex(company => company.Code).IsUnique()
                .HasFilter("[Code] IS NOT NULL");
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.HasKey(location => location.LocationId);
            entity.Property(location => location.Name).HasMaxLength(200).IsRequired();
            entity.Property(location => location.Code).HasMaxLength(50);
            entity.HasOne(location => location.Company)
                .WithMany(company => company.Locations)
                .HasForeignKey(location => location.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(location => location.Region)
                .WithMany(region => region.Locations)
                .HasForeignKey(location => location.RegionId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(location => location.Address)
                .WithOne(address => address.Location)
                .HasForeignKey<Location>(location => location.AddressId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(location => new { location.CompanyId, location.Code }).IsUnique()
                .HasFilter("[Code] IS NOT NULL");
            entity.HasIndex(location => location.AddressId).IsUnique();
        });

        modelBuilder.Entity<LookupCategory>(entity =>
        {
            entity.HasKey(category => category.LookupCategoryId);
            entity.Property(category => category.Name).HasMaxLength(150).IsRequired();
            entity.Property(category => category.Code).HasMaxLength(80).IsRequired();
            entity.Property(category => category.Value).IsRequired();
            entity.HasIndex(category => category.Code).IsUnique();
            entity.HasIndex(category => category.Value).IsUnique();

        });

        modelBuilder.Entity<Lookup>(entity =>
        {
            entity.HasKey(lookup => lookup.LookupId);
            entity.Property(lookup => lookup.Name).HasMaxLength(150).IsRequired();
            entity.Property(lookup => lookup.Code).HasMaxLength(80).IsRequired();
            entity.HasOne(lookup => lookup.LookupCategory)
                .WithMany(category => category.Lookups)
                .HasForeignKey(lookup => lookup.LookupCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(lookup => lookup.ParentLookup)
                .WithMany(lookup => lookup.Children)
                .HasForeignKey(lookup => lookup.ParentLookupId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(lookup => lookup.LookupCategoryId);
            entity.HasIndex(lookup => lookup.ParentLookupId);
            entity.HasIndex(lookup => new { lookup.LookupCategoryId, lookup.Code }).IsUnique();
            entity.HasIndex(lookup => new { lookup.LookupCategoryId, lookup.Value }).IsUnique();

        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(permission => permission.PermissionId);
            entity.Property(permission => permission.Code).HasMaxLength(100).IsRequired();
            entity.Property(permission => permission.Name).HasMaxLength(150).IsRequired();
            entity.Property(permission => permission.Description).HasMaxLength(1000);
            entity.HasIndex(permission => permission.Code).IsUnique();
        });

        modelBuilder.Entity<Region>(entity =>
        {
            entity.HasKey(region => region.RegionId);
            entity.Property(region => region.Name).HasMaxLength(150).IsRequired();
            entity.Property(region => region.Code).HasMaxLength(50);
            entity.HasIndex(region => region.Code).IsUnique()
                .HasFilter("[Code] IS NOT NULL");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(role => role.RoleId);
            entity.Property(role => role.Name).HasMaxLength(150).IsRequired();
            entity.Property(role => role.Description).HasMaxLength(1000);
            entity.HasOne(role => role.CompanyScope)
                .WithMany(lookup => lookup.CompanyScopeRoles)
                .HasForeignKey(role => role.CompanyScopeLookupId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(role => role.CompanyScopeLookupId);
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(rolePermission => new { rolePermission.RoleId, rolePermission.PermissionId });
            entity.HasOne(rolePermission => rolePermission.Role)
                .WithMany(role => role.RolePermissions)
                .HasForeignKey(rolePermission => rolePermission.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(rolePermission => rolePermission.Permission)
                .WithMany(permission => permission.RolePermissions)
                .HasForeignKey(rolePermission => rolePermission.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(project => project.ProjectId);
            entity.Property(project => project.Name).HasMaxLength(200).IsRequired();
            entity.Property(project => project.ProjectNumber).HasMaxLength(80);
            entity.Property(project => project.CustomerName).HasMaxLength(200);
            entity.Property(project => project.Location).HasMaxLength(200);
            entity.Property(project => project.Status).HasMaxLength(50).IsRequired();
            entity.HasOne(project => project.CreatedByUser)
                .WithMany(user => user.CreatedProjects)
                .HasForeignKey(project => project.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.HasKey(schedule => schedule.ScheduleId);
            entity.Property(schedule => schedule.Name).HasMaxLength(200).IsRequired();
            entity.Property(schedule => schedule.Description).HasMaxLength(1000);
            entity.HasOne(schedule => schedule.Project)
                .WithMany(project => project.Schedules)
                .HasForeignKey(schedule => schedule.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LineItem>(entity =>
        {
            entity.HasKey(lineItem => lineItem.LineItemId);
            entity.Property(lineItem => lineItem.Tag).HasMaxLength(80).IsRequired();
            entity.Property(lineItem => lineItem.Status).HasMaxLength(50).IsRequired();
            entity.HasOne(lineItem => lineItem.Schedule)
                .WithMany(schedule => schedule.LineItems)
                .HasForeignKey(lineItem => lineItem.ScheduleId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(lineItem => lineItem.ProductModel)
                .WithMany(productModel => productModel.LineItems)
                .HasForeignKey(lineItem => lineItem.ProductModelId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductType>(entity =>
        {
            entity.HasKey(productType => productType.ProductTypeId);
            entity.Property(productType => productType.Name).HasMaxLength(150).IsRequired();
            entity.Property(productType => productType.Description).HasMaxLength(1000);
            entity.HasIndex(productType => productType.Name).IsUnique();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(product => product.ProductId);
            entity.Property(product => product.Name).HasMaxLength(200).IsRequired();
            entity.Property(product => product.Description).HasMaxLength(1000);
            entity.HasOne(product => product.ProductType)
                .WithMany(productType => productType.Products)
                .HasForeignKey(product => product.ProductTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductModel>(entity =>
        {
            entity.HasKey(productModel => productModel.ProductModelId);
            entity.Property(productModel => productModel.ModelNumber).HasMaxLength(100).IsRequired();
            entity.Property(productModel => productModel.Description).HasMaxLength(1000);
            entity.HasOne(productModel => productModel.Product)
                .WithMany(product => product.ProductModels)
                .HasForeignKey(productModel => productModel.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(productModel => new { productModel.ProductId, productModel.ModelNumber }).IsUnique();
        });

        modelBuilder.Entity<ProductOptionGroup>(entity =>
        {
            entity.HasKey(group => group.ProductOptionGroupId);
            entity.Property(group => group.Name).HasMaxLength(150).IsRequired();
            entity.HasOne(group => group.Product)
                .WithMany(product => product.OptionGroups)
                .HasForeignKey(group => group.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(group => new { group.ProductId, group.Name }).IsUnique();
        });

        modelBuilder.Entity<ProductOption>(entity =>
        {
            entity.HasKey(option => option.ProductOptionId);
            entity.Property(option => option.Name).HasMaxLength(150).IsRequired();
            entity.Property(option => option.Value).HasMaxLength(150);
            entity.HasOne(option => option.ProductOptionGroup)
                .WithMany(group => group.Options)
                .HasForeignKey(option => option.ProductOptionGroupId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LineItemSelection>(entity =>
        {
            entity.HasKey(selection => selection.LineItemSelectionId);
            entity.HasOne(selection => selection.LineItem)
                .WithMany(lineItem => lineItem.Selections)
                .HasForeignKey(selection => selection.LineItemId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(selection => selection.ProductOption)
                .WithMany(option => option.LineItemSelections)
                .HasForeignKey(selection => selection.ProductOptionId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(selection => new { selection.LineItemId, selection.ProductOptionId }).IsUnique();
        });

        modelBuilder.SeedMilestoneTwoData();
        modelBuilder.SeedMilestoneOneData();
    }
}
