using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AngularWorkbench.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLookupCategoryValue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "LookupCategories",
                keyColumn: "LookupCategoryId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "LookupCategories",
                keyColumn: "LookupCategoryId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "LookupCategories",
                keyColumn: "LookupCategoryId",
                keyValue: 3);

            migrationBuilder.AddColumn<int>(
                name: "Value",
                table: "LookupCategories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "LookupCategories",
                keyColumn: "LookupCategoryId",
                keyValue: 1,
                column: "Value",
                value: 1);

            migrationBuilder.UpdateData(
                table: "LookupCategories",
                keyColumn: "LookupCategoryId",
                keyValue: 2,
                column: "Value",
                value: 2);

            migrationBuilder.CreateIndex(
                name: "IX_LookupCategories_Value",
                table: "LookupCategories",
                column: "Value",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LookupCategories_Value",
                table: "LookupCategories");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "LookupCategories");

            migrationBuilder.InsertData(
                table: "LookupCategories",
                columns: new[] { "LookupCategoryId", "Code", "IsActive", "Name" },
                values: new object[,]
                {
                    { 3, "COUNTRY", true, "Country" },
                    { 4, "STATE", true, "State" },
                    { 5, "CITY", true, "City" }
                });

            // Country
            migrationBuilder.InsertData(
                table: "Lookups",
                columns: new[]
                {
                    "LookupId",
                    "Code",
                    "IsActive",
                    "LookupCategoryId",
                    "Name",
                    "ParentLookupId",
                    "SortOrder",
                    "Value"
                            },
                            values: new object[]
                            {
                    7, "US", true, 3,
                    "United States", null, 10, 1
                            });

                        // States
                        migrationBuilder.InsertData(
                            table: "Lookups",
                            columns: new[]
                            {
                    "LookupId",
                    "Code",
                    "IsActive",
                    "LookupCategoryId",
                    "Name",
                    "ParentLookupId",
                    "SortOrder",
                    "Value"
                            },
                            values: new object[,]
                            {
                    { 8, "TX", true, 4, "Texas", 7, 10, 1 },
                    { 9, "GA", true, 4, "Georgia", 7, 20, 2 }
                            });

                        // Cities
                        migrationBuilder.InsertData(
                            table: "Lookups",
                            columns: new[]
                            {
                    "LookupId",
                    "Code",
                    "IsActive",
                    "LookupCategoryId",
                    "Name",
                    "ParentLookupId",
                    "SortOrder",
                    "Value"
                            },
                            values: new object[,]
                            {
                    { 10, "DALLAS", true, 5, "Dallas", 8, 10, 1 },
                    { 11, "GARLAND", true, 5, "Garland", 8, 20, 2 },
                    { 12, "FORT_WORTH", true, 5, "Fort Worth", 8, 30, 3 },
                    { 13, "ATLANTA", true, 5, "Atlanta", 9, 10, 4 }
                            });
                    }
                }
}
