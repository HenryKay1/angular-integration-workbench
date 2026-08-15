using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AngularWorkbench.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLookupScopedRoleAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_AppUserRoles",
                table: "AppUserRoles");

            migrationBuilder.DeleteData(
                table: "AppUserRoles",
                keyColumns: new[] { "AppUserId", "RoleId" },
                keyValues: new object[] { 1, 1 });

            migrationBuilder.DeleteData(
                table: "AppUserRoles",
                keyColumns: new[] { "AppUserId", "RoleId" },
                keyValues: new object[] { 1, 2 });

            migrationBuilder.AddColumn<int>(
                name: "CompanyScopeLookupId",
                table: "Roles",
                type: "int",
                nullable: false,
                defaultValue: 6);

            migrationBuilder.AddColumn<bool>(
                name: "HasAllPermissions",
                table: "Roles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "AppUserRoleId",
                table: "AppUserRoles",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "AccessScopeLookupId",
                table: "AppUserRoles",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "AppUserRoles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RegionId",
                table: "AppUserRoles",
                type: "int",
                nullable: true);

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

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppUserRoles",
                table: "AppUserRoles",
                column: "AppUserRoleId");

            migrationBuilder.CreateTable(
                name: "LookupCategories",
                columns: table => new
                {
                    LookupCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookupCategories", x => x.LookupCategoryId);
                });

            migrationBuilder.CreateTable(
                name: "Lookups",
                columns: table => new
                {
                    LookupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LookupCategoryId = table.Column<int>(type: "int", nullable: false),
                    ParentLookupId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lookups", x => x.LookupId);
                    table.ForeignKey(
                        name: "FK_Lookups_LookupCategories_LookupCategoryId",
                        column: x => x.LookupCategoryId,
                        principalTable: "LookupCategories",
                        principalColumn: "LookupCategoryId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Lookups_Lookups_ParentLookupId",
                        column: x => x.ParentLookupId,
                        principalTable: "Lookups",
                        principalColumn: "LookupId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 1,
                columns: new[] { "CityLookupId", "CountryLookupId", "StateLookupId" },
                values: new object[] { 10, 7, 8 });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 2,
                columns: new[] { "CityLookupId", "CountryLookupId", "StateLookupId" },
                values: new object[] { 13, 7, 9 });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 3,
                columns: new[] { "CityLookupId", "CountryLookupId", "StateLookupId" },
                values: new object[] { 12, 7, 8 });

            migrationBuilder.InsertData(
                table: "LookupCategories",
                columns: new[] { "LookupCategoryId", "Code", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "ACCESS_SCOPE", true, "Access Scope" },
                    { 2, "COMPANY_SCOPE", true, "Company Scope" },
                    { 3, "COUNTRY", true, "Country" },
                    { 4, "STATE", true, "State" },
                    { 5, "CITY", true, "City" }
                });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 1,
                columns: new[] { "CompanyScopeLookupId", "HasAllPermissions" },
                values: new object[] { 4, true });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 2,
                columns: new[] { "CompanyScopeLookupId", "HasAllPermissions" },
                values: new object[] { 4, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 3,
                columns: new[] { "CompanyScopeLookupId", "HasAllPermissions" },
                values: new object[] { 4, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 4,
                columns: new[] { "CompanyScopeLookupId", "HasAllPermissions" },
                values: new object[] { 4, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 5,
                columns: new[] { "CompanyScopeLookupId", "HasAllPermissions" },
                values: new object[] { 5, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 6,
                columns: new[] { "CompanyScopeLookupId", "HasAllPermissions" },
                values: new object[] { 5, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 7,
                columns: new[] { "CompanyScopeLookupId", "HasAllPermissions" },
                values: new object[] { 6, false });

            migrationBuilder.InsertData(
                table: "Lookups",
                columns: new[] { "LookupId", "Code", "IsActive", "LookupCategoryId", "Name", "ParentLookupId", "SortOrder" },
                values: new object[,]
                {
                    { 1, "GLOBAL", true, 1, "Global", null, 10 },
                    { 2, "COMPANY", true, 1, "Company", null, 20 },
                    { 3, "REGION", true, 1, "Region", null, 30 },
                    { 4, "INTERNAL", true, 2, "Internal", null, 10 },
                    { 5, "EXTERNAL", true, 2, "External", null, 20 },
                    { 6, "BOTH", true, 2, "Both", null, 30 },
                    { 7, "US", true, 3, "United States", null, 10 }
                });

            migrationBuilder.InsertData(
                table: "AppUserRoles",
                columns: new[] { "AppUserRoleId", "AccessScopeLookupId", "AppUserId", "CompanyId", "RegionId", "RoleId" },
                values: new object[,]
                {
                    { 1, 1, 1, null, null, 1 },
                    { 2, 3, 1, null, 1, 2 },
                    { 3, 3, 1, null, 2, 2 }
                });

            migrationBuilder.InsertData(
                table: "Lookups",
                columns: new[] { "LookupId", "Code", "IsActive", "LookupCategoryId", "Name", "ParentLookupId", "SortOrder" },
                values: new object[,]
                {
                    { 8, "TX", true, 4, "Texas", 7, 10 },
                    { 9, "GA", true, 4, "Georgia", 7, 20 },
                    { 10, "DALLAS", true, 5, "Dallas", 8, 10 },
                    { 11, "GARLAND", true, 5, "Garland", 8, 20 },
                    { 12, "FORT_WORTH", true, 5, "Fort Worth", 8, 30 },
                    { 13, "ATLANTA", true, 5, "Atlanta", 9, 10 }
                });

            migrationBuilder.Sql("""
                UPDATE Roles
                SET CompanyScopeLookupId = CASE CompanyScope
                    WHEN 'Internal' THEN 4
                    WHEN 'External' THEN 5
                    WHEN 'Both' THEN 6
                    ELSE CompanyScopeLookupId
                END;
                """);

            migrationBuilder.Sql("""
                UPDATE Addresses
                SET CountryLookupId = CASE
                        WHEN Country IN ('USA', 'US', 'United States') THEN 7
                        ELSE CountryLookupId
                    END,
                    StateLookupId = CASE
                        WHEN State = 'TX' THEN 8
                        WHEN State = 'GA' THEN 9
                        ELSE StateLookupId
                    END,
                    CityLookupId = CASE
                        WHEN City = 'Dallas' THEN 10
                        WHEN City = 'Garland' THEN 11
                        WHEN City = 'Fort Worth' THEN 12
                        WHEN City = 'Atlanta' THEN 13
                        ELSE CityLookupId
                    END;
                """);

            migrationBuilder.DropColumn(
                name: "CompanyScope",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Addresses");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_CompanyScopeLookupId",
                table: "Roles",
                column: "CompanyScopeLookupId");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserRoles_AccessScopeLookupId",
                table: "AppUserRoles",
                column: "AccessScopeLookupId");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserRoles_AppUserId",
                table: "AppUserRoles",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserRoles_CompanyId",
                table: "AppUserRoles",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserRoles_RegionId",
                table: "AppUserRoles",
                column: "RegionId");

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

            migrationBuilder.CreateIndex(
                name: "IX_LookupCategories_Code",
                table: "LookupCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lookups_LookupCategoryId",
                table: "Lookups",
                column: "LookupCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Lookups_LookupCategoryId_Code",
                table: "Lookups",
                columns: new[] { "LookupCategoryId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lookups_ParentLookupId",
                table: "Lookups",
                column: "ParentLookupId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserRoles_Companies_CompanyId",
                table: "AppUserRoles",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "CompanyId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserRoles_Lookups_AccessScopeLookupId",
                table: "AppUserRoles",
                column: "AccessScopeLookupId",
                principalTable: "Lookups",
                principalColumn: "LookupId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserRoles_Regions_RegionId",
                table: "AppUserRoles",
                column: "RegionId",
                principalTable: "Regions",
                principalColumn: "RegionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_Lookups_CompanyScopeLookupId",
                table: "Roles",
                column: "CompanyScopeLookupId",
                principalTable: "Lookups",
                principalColumn: "LookupId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropForeignKey(
                name: "FK_AppUserRoles_Companies_CompanyId",
                table: "AppUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AppUserRoles_Lookups_AccessScopeLookupId",
                table: "AppUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AppUserRoles_Regions_RegionId",
                table: "AppUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Lookups_CompanyScopeLookupId",
                table: "Roles");

            migrationBuilder.DropTable(
                name: "Lookups");

            migrationBuilder.DropTable(
                name: "LookupCategories");

            migrationBuilder.DropIndex(
                name: "IX_Roles_CompanyScopeLookupId",
                table: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppUserRoles",
                table: "AppUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_AppUserRoles_AccessScopeLookupId",
                table: "AppUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_AppUserRoles_AppUserId",
                table: "AppUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_AppUserRoles_CompanyId",
                table: "AppUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_AppUserRoles_RegionId",
                table: "AppUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_CityLookupId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_CountryLookupId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_StateLookupId",
                table: "Addresses");

            migrationBuilder.DeleteData(
                table: "AppUserRoles",
                keyColumn: "AppUserRoleId",
                keyColumnType: "int",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "AppUserRoles",
                keyColumn: "AppUserRoleId",
                keyColumnType: "int",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "AppUserRoles",
                keyColumn: "AppUserRoleId",
                keyColumnType: "int",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "CompanyScopeLookupId",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "HasAllPermissions",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "AppUserRoleId",
                table: "AppUserRoles");

            migrationBuilder.DropColumn(
                name: "AccessScopeLookupId",
                table: "AppUserRoles");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "AppUserRoles");

            migrationBuilder.DropColumn(
                name: "RegionId",
                table: "AppUserRoles");

            migrationBuilder.DropColumn(
                name: "CityLookupId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "CountryLookupId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "StateLookupId",
                table: "Addresses");

            migrationBuilder.AddColumn<string>(
                name: "CompanyScope",
                table: "Roles",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Addresses",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppUserRoles",
                table: "AppUserRoles",
                columns: new[] { "AppUserId", "RoleId" });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 1,
                columns: new[] { "City", "Country", "State" },
                values: new object[] { "Dallas", "USA", "TX" });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 2,
                columns: new[] { "City", "Country", "State" },
                values: new object[] { "Atlanta", "USA", "GA" });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 3,
                columns: new[] { "City", "Country", "State" },
                values: new object[] { "Fort Worth", "USA", "TX" });

            migrationBuilder.InsertData(
                table: "AppUserRoles",
                columns: new[] { "AppUserId", "RoleId" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 1, 2 }
                });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 1,
                column: "CompanyScope",
                value: "Internal");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 2,
                column: "CompanyScope",
                value: "Internal");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 3,
                column: "CompanyScope",
                value: "Internal");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 4,
                column: "CompanyScope",
                value: "Internal");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 5,
                column: "CompanyScope",
                value: "External");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 6,
                column: "CompanyScope",
                value: "External");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 7,
                column: "CompanyScope",
                value: "Both");
        }
    }
}
