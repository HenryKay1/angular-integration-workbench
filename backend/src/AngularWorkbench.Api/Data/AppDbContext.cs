using AngularWorkbench.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<LineItem> LineItems => Set<LineItem>();
    public DbSet<ProductType> ProductTypes => Set<ProductType>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductModel> ProductModels => Set<ProductModel>();
    public DbSet<ProductOptionGroup> ProductOptionGroups => Set<ProductOptionGroup>();
    public DbSet<ProductOption> ProductOptions => Set<ProductOption>();
    public DbSet<LineItemSelection> LineItemSelections => Set<LineItemSelection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasKey(user => user.AppUserId);
            entity.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.LastName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.Email).HasMaxLength(320).IsRequired();
            entity.HasIndex(user => user.Email).IsUnique();
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

        modelBuilder.SeedMilestoneOneData();
    }
}
