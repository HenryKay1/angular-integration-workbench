using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AngularWorkbench.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLookupGeography : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Lookups_CityLookupId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Lookups_CountryLookupId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Lookups_StateLookupId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_CityLookupId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_CountryLookupId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_StateLookupId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "CityLookupId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "CountryLookupId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "StateLookupId",
                table: "Addresses");

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 1,
                columns: new[] { "CityId", "CountryId", "StateId" },
                values: new object[] { 1, 1, 1 });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 2,
                columns: new[] { "CityId", "CountryId", "StateId" },
                values: new object[] { 4, 1, 2 });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 3,
                columns: new[] { "CityId", "CountryId", "StateId" },
                values: new object[] { 3, 1, 1 });

            migrationBuilder.Sql("""
                DELETE FROM Lookups
                WHERE LookupId IN (10, 11, 12, 13);

                DELETE FROM Lookups
                WHERE LookupId IN (8, 9);

                DELETE FROM Lookups
                WHERE LookupId = 7;

                DELETE FROM LookupCategories
                WHERE LookupCategoryId IN (3, 4, 5);
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "LookupCategories",
                columns: new[]
                {
                    "LookupCategoryId",
                    "Name",
                    "Code",
                    "IsActive"
                },
                values: new object[,]
                {
                    { 3, "Country", "COUNTRY", true },
                    { 4, "State", "STATE", true },
                    { 5, "City", "CITY", true }
                });

            migrationBuilder.InsertData(
                table: "Lookups",
                columns: new[]
                {
                    "LookupId",
                    "LookupCategoryId",
                    "ParentLookupId",
                    "Value",
                    "Name",
                    "Code",
                    "SortOrder",
                    "IsActive"
                },
                values: new object[,]
                {
                    { 7, 3, null, 1, "United States", "US", 10, true },

                    { 8, 4, 7, 1, "Texas", "TX", 10, true },
                    { 9, 4, 7, 2, "Georgia", "GA", 20, true },

                    { 10, 5, 8, 1, "Dallas", "DALLAS", 10, true },
                    { 11, 5, 8, 2, "Garland", "GARLAND", 20, true },
                    { 12, 5, 8, 3, "Fort Worth", "FORT_WORTH", 30, true },
                    { 13, 5, 9, 4, "Atlanta", "ATLANTA", 10, true }
                });

            migrationBuilder.AddColumn<int>(
                name: "CityLookupId",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CountryLookupId",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StateLookupId",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 1,
                columns: new[] { "CityId", "CityLookupId", "CountryId", "CountryLookupId", "StateId", "StateLookupId" },
                values: new object[] { null, 10, null, 7, null, 8 });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 2,
                columns: new[] { "CityId", "CityLookupId", "CountryId", "CountryLookupId", "StateId", "StateLookupId" },
                values: new object[] { null, 13, null, 7, null, 9 });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 3,
                columns: new[] { "CityId", "CityLookupId", "CountryId", "CountryLookupId", "StateId", "StateLookupId" },
                values: new object[] { null, 12, null, 7, null, 8 });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CityLookupId",
                table: "Addresses",
                column: "CityLookupId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CountryLookupId",
                table: "Addresses",
                column: "CountryLookupId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_StateLookupId",
                table: "Addresses",
                column: "StateLookupId");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Lookups_CityLookupId",
                table: "Addresses",
                column: "CityLookupId",
                principalTable: "Lookups",
                principalColumn: "LookupId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Lookups_CountryLookupId",
                table: "Addresses",
                column: "CountryLookupId",
                principalTable: "Lookups",
                principalColumn: "LookupId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Lookups_StateLookupId",
                table: "Addresses",
                column: "StateLookupId",
                principalTable: "Lookups",
                principalColumn: "LookupId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
