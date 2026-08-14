using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AngularWorkbench.Api.Tests;

public sealed class MilestoneOneModelSmokeTests
{
    [Fact]
    public async Task ProductCatalogRelationshipsCanBeLoaded()
    {
        await WithContextAsync(async context =>
        {
            var productType = await context.ProductTypes
                .Include(type => type.Products)
                .ThenInclude(product => product.ProductModels)
                .SingleAsync(type => type.Name == "Rooftop Unit");

            Assert.Contains(productType.Products, product => product.Name == "Commercial Packaged Rooftop Unit");

            var product = await context.Products
                .Include(item => item.ProductModels)
                .Include(item => item.OptionGroups)
                .ThenInclude(group => group.Options)
                .SingleAsync(item => item.Name == "Commercial Packaged Rooftop Unit");

            Assert.Equal(3, product.ProductModels.Count);
            Assert.Equal(["Heating", "Cooling", "Air", "Electrical Heat"], product.OptionGroups.OrderBy(group => group.SortOrder).Select(group => group.Name));
            Assert.All(product.OptionGroups, group => Assert.NotEmpty(group.Options));
        });
    }

    [Fact]
    public async Task ProjectHierarchyCanContainSchedulesAndLineItems()
    {
        await WithContextAsync(async context =>
        {
            var project = await context.Projects
                .Include(item => item.Schedules)
                .ThenInclude(schedule => schedule.LineItems)
                .SingleAsync(item => item.ProjectNumber == "NC-2026-014");

            var schedule = Assert.Single(project.Schedules);
            var lineItem = Assert.Single(schedule.LineItems);

            Assert.Equal("Rooftop Unit Schedule", schedule.Name);
            Assert.Equal("RTU-1", lineItem.Tag);
            Assert.Equal(1, lineItem.Quantity);
        });
    }

    [Fact]
    public async Task ConfiguredLineItemDerivesProductAndOptionGroupContext()
    {
        await WithContextAsync(async context =>
        {
            var lineItem = await context.LineItems
                .Include(item => item.ProductModel!)
                .ThenInclude(model => model.Product)
                .ThenInclude(product => product.ProductType)
                .Include(item => item.Selections)
                .ThenInclude(selection => selection.ProductOption)
                .ThenInclude(option => option.ProductOptionGroup)
                .SingleAsync(item => item.Tag == "RTU-1");

            Assert.Equal("RT-120", lineItem.ProductModel!.ModelNumber);
            Assert.Equal("Commercial Packaged Rooftop Unit", lineItem.ProductModel.Product.Name);
            Assert.Equal("Rooftop Unit", lineItem.ProductModel.Product.ProductType.Name);

            var selectionsByGroup = lineItem.Selections
                .GroupBy(selection => selection.ProductOption.ProductOptionGroup.Name)
                .ToDictionary(group => group.Key, group => group.Select(selection => selection.ProductOption.Value).ToArray());

            Assert.Contains("Gas", selectionsByGroup["Heating"]);
            Assert.Contains("High Efficiency", selectionsByGroup["Cooling"]);
            Assert.Contains("High Static", selectionsByGroup["Air"]);
            Assert.Contains("15 kW", selectionsByGroup["Electrical Heat"]);
        });
    }

    [Fact]
    public void ModelAvoidsDeferredOrRedundantForeignKeys()
    {
        Assert.DoesNotContain(typeof(LineItem).GetProperties(), property => property.Name is "ProductId" or "ProductTypeId");
        Assert.DoesNotContain(typeof(LineItemSelection).GetProperties(), property => property.Name == "ProductOptionGroupId");
        Assert.DoesNotContain(typeof(ProductOptionGroup).GetProperties(), property => property.Name == "LineItemId");
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
