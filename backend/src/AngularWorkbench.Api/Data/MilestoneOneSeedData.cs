using AngularWorkbench.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Data;

public static class MilestoneOneSeedData
{
    private static readonly DateTime SeededUtc = new(2026, 08, 14, 12, 0, 0, DateTimeKind.Utc);

    public static void SeedMilestoneOneData(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>().HasData(
            new AppUser
            {
                AppUserId = 1,
                FirstName = "Avery",
                LastName = "Morgan",
                Email = "avery.morgan@example.com",
                IsActive = true,
                CreatedUtc = SeededUtc,
                CompanyId = 1,
                LocationId = 1
            });

        modelBuilder.Entity<ProductType>().HasData(
            new ProductType { ProductTypeId = 1, Name = "Rooftop Unit", Description = "Packaged rooftop HVAC equipment." },
            new ProductType { ProductTypeId = 2, Name = "Air Handler", Description = "Indoor air handling equipment." },
            new ProductType { ProductTypeId = 3, Name = "Heat Pump", Description = "Heating and cooling heat pump equipment." });

        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                ProductId = 1,
                ProductTypeId = 1,
                Name = "Commercial Packaged Rooftop Unit",
                Description = "Configurable rooftop unit for commercial schedules.",
                IsActive = true
            });

        modelBuilder.Entity<ProductModel>().HasData(
            new ProductModel { ProductModelId = 1, ProductId = 1, ModelNumber = "RT-090", Description = "90 MBH nominal capacity.", IsActive = true },
            new ProductModel { ProductModelId = 2, ProductId = 1, ModelNumber = "RT-120", Description = "120 MBH nominal capacity.", IsActive = true },
            new ProductModel { ProductModelId = 3, ProductId = 1, ModelNumber = "RT-150", Description = "150 MBH nominal capacity.", IsActive = true });

        modelBuilder.Entity<ProductOptionGroup>().HasData(
            new ProductOptionGroup { ProductOptionGroupId = 1, ProductId = 1, Name = "Heating", SortOrder = 10 },
            new ProductOptionGroup { ProductOptionGroupId = 2, ProductId = 1, Name = "Cooling", SortOrder = 20 },
            new ProductOptionGroup { ProductOptionGroupId = 3, ProductId = 1, Name = "Air", SortOrder = 30 },
            new ProductOptionGroup { ProductOptionGroupId = 4, ProductId = 1, Name = "Electrical Heat", SortOrder = 40 });

        modelBuilder.Entity<ProductOption>().HasData(
            new ProductOption { ProductOptionId = 1, ProductOptionGroupId = 1, Name = "Heating Type", Value = "Gas", SortOrder = 10, IsActive = true },
            new ProductOption { ProductOptionId = 2, ProductOptionGroupId = 1, Name = "Heating Type", Value = "Electric", SortOrder = 20, IsActive = true },
            new ProductOption { ProductOptionId = 3, ProductOptionGroupId = 1, Name = "Voltage", Value = "208/230V", SortOrder = 30, IsActive = true },
            new ProductOption { ProductOptionId = 4, ProductOptionGroupId = 1, Name = "Voltage", Value = "460V", SortOrder = 40, IsActive = true },
            new ProductOption { ProductOptionId = 5, ProductOptionGroupId = 1, Name = "Coil", Value = "2 Row", SortOrder = 50, IsActive = true },
            new ProductOption { ProductOptionId = 6, ProductOptionGroupId = 1, Name = "Coil", Value = "3 Row", SortOrder = 60, IsActive = true },
            new ProductOption { ProductOptionId = 7, ProductOptionGroupId = 2, Name = "Cooling Type", Value = "Standard", SortOrder = 10, IsActive = true },
            new ProductOption { ProductOptionId = 8, ProductOptionGroupId = 2, Name = "Cooling Type", Value = "High Efficiency", SortOrder = 20, IsActive = true },
            new ProductOption { ProductOptionId = 9, ProductOptionGroupId = 2, Name = "Voltage", Value = "208/230V", SortOrder = 30, IsActive = true },
            new ProductOption { ProductOptionId = 10, ProductOptionGroupId = 2, Name = "Voltage", Value = "460V", SortOrder = 40, IsActive = true },
            new ProductOption { ProductOptionId = 11, ProductOptionGroupId = 2, Name = "Coil", Value = "2 Row", SortOrder = 50, IsActive = true },
            new ProductOption { ProductOptionId = 12, ProductOptionGroupId = 2, Name = "Coil", Value = "3 Row", SortOrder = 60, IsActive = true },
            new ProductOption { ProductOptionId = 13, ProductOptionGroupId = 3, Name = "Airflow", Value = "Standard", SortOrder = 10, IsActive = true },
            new ProductOption { ProductOptionId = 14, ProductOptionGroupId = 3, Name = "Airflow", Value = "High Static", SortOrder = 20, IsActive = true },
            new ProductOption { ProductOptionId = 15, ProductOptionGroupId = 3, Name = "Motor", Value = "ECM", SortOrder = 30, IsActive = true },
            new ProductOption { ProductOptionId = 16, ProductOptionGroupId = 3, Name = "Motor", Value = "PSC", SortOrder = 40, IsActive = true },
            new ProductOption { ProductOptionId = 17, ProductOptionGroupId = 4, Name = "Heat Size", Value = "10 kW", SortOrder = 10, IsActive = true },
            new ProductOption { ProductOptionId = 18, ProductOptionGroupId = 4, Name = "Heat Size", Value = "15 kW", SortOrder = 20, IsActive = true },
            new ProductOption { ProductOptionId = 19, ProductOptionGroupId = 4, Name = "Heat Size", Value = "20 kW", SortOrder = 30, IsActive = true });

        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                ProjectId = 1,
                Name = "North Campus Mechanical Upgrade",
                ProjectNumber = "NC-2026-014",
                CustomerName = "North Campus Facilities",
                Location = "Chicago, IL",
                Status = "Draft",
                CreatedUtc = SeededUtc,
                ModifiedUtc = SeededUtc,
                CreatedByUserId = 1
            });

        modelBuilder.Entity<Schedule>().HasData(
            new Schedule
            {
                ScheduleId = 1,
                ProjectId = 1,
                Name = "Rooftop Unit Schedule",
                Description = "Initial mechanical equipment schedule.",
                SortOrder = 10
            });

        modelBuilder.Entity<LineItem>().HasData(
            new LineItem
            {
                LineItemId = 1,
                ScheduleId = 1,
                ProductModelId = 2,
                Tag = "RTU-1",
                Quantity = 1,
                Status = "Configured"
            });

        modelBuilder.Entity<LineItemSelection>().HasData(
            new LineItemSelection { LineItemSelectionId = 1, LineItemId = 1, ProductOptionId = 1, SelectedUtc = SeededUtc },
            new LineItemSelection { LineItemSelectionId = 2, LineItemId = 1, ProductOptionId = 4, SelectedUtc = SeededUtc },
            new LineItemSelection { LineItemSelectionId = 3, LineItemId = 1, ProductOptionId = 8, SelectedUtc = SeededUtc },
            new LineItemSelection { LineItemSelectionId = 4, LineItemId = 1, ProductOptionId = 10, SelectedUtc = SeededUtc },
            new LineItemSelection { LineItemSelectionId = 5, LineItemId = 1, ProductOptionId = 14, SelectedUtc = SeededUtc },
            new LineItemSelection { LineItemSelectionId = 6, LineItemId = 1, ProductOptionId = 15, SelectedUtc = SeededUtc },
            new LineItemSelection { LineItemSelectionId = 7, LineItemId = 1, ProductOptionId = 18, SelectedUtc = SeededUtc });
    }
}
