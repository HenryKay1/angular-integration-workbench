using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AngularWorkbench.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGeographyTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Value",
                table: "Lookups",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CityId",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CountryId",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StateId",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    CountryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.CountryId);
                });

            migrationBuilder.CreateTable(
                name: "States",
                columns: table => new
                {
                    StateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_States", x => x.StateId);
                    table.ForeignKey(
                        name: "FK_States_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "CountryId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    CityId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StateId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.CityId);
                    table.ForeignKey(
                        name: "FK_Cities_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "StateId",
                        onDelete: ReferentialAction.Restrict);
                });



            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 1,
                columns: new[] { "CityId", "CountryId", "StateId" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 2,
                columns: new[] { "CityId", "CountryId", "StateId" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "Addresses",
                keyColumn: "AddressId",
                keyValue: 3,
                columns: new[] { "CityId", "CountryId", "StateId" },
                values: new object[] { null, null, null });


            migrationBuilder.Sql("""
                INSERT INTO Countries (Name, Code, IsActive)
                SELECT Name, Code, IsActive
                FROM Lookups
                WHERE LookupCategoryId = 3;
            """);

            migrationBuilder.Sql("""
                INSERT INTO States (CountryId, Name, Code, IsActive)
                SELECT
                    c.CountryId,
                    s.Name,
                    s.Code,
                    s.IsActive
                FROM Lookups s
                INNER JOIN Lookups countryLookup
                    ON countryLookup.LookupId = s.ParentLookupId
                INNER JOIN Countries c
                    ON c.Code = countryLookup.Code
                WHERE s.LookupCategoryId = 4;
            """);

            migrationBuilder.Sql("""
                INSERT INTO Cities (StateId, Name, Code, IsActive)
                SELECT
                    s.StateId,
                    cityLookup.Name,
                    cityLookup.Code,
                    cityLookup.IsActive
                FROM Lookups cityLookup
                INNER JOIN Lookups stateLookup
                    ON stateLookup.LookupId = cityLookup.ParentLookupId
                INNER JOIN States s
                    ON s.Code = stateLookup.Code
                WHERE cityLookup.LookupCategoryId = 5;
            """);
            migrationBuilder.Sql("""
                UPDATE a
                SET CountryId = c.CountryId
                FROM Addresses a
                INNER JOIN Lookups l
                    ON l.LookupId = a.CountryLookupId
                INNER JOIN Countries c
                    ON c.Code = l.Code
                WHERE a.CountryLookupId IS NOT NULL;
            """);
            migrationBuilder.Sql("""
                UPDATE a
                SET StateId = s.StateId
                FROM Addresses a
                INNER JOIN Lookups stateLookup
                    ON stateLookup.LookupId = a.StateLookupId
                INNER JOIN States s
                    ON s.Code = stateLookup.Code
                WHERE a.StateLookupId IS NOT NULL;
            """);

                        migrationBuilder.Sql("""
                UPDATE a
                SET CityId = c.CityId
                FROM Addresses a
                INNER JOIN Lookups cityLookup
                    ON cityLookup.LookupId = a.CityLookupId
                INNER JOIN Cities c
                    ON c.Code = cityLookup.Code
                WHERE a.CityLookupId IS NOT NULL;
            """);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 1,
                column: "Value",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 2,
                column: "Value",
                value: 2);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 3,
                column: "Value",
                value: 3);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 4,
                column: "Value",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 5,
                column: "Value",
                value: 2);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 6,
                column: "Value",
                value: 3);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 7,
                column: "Value",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 8,
                column: "Value",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 9,
                column: "Value",
                value: 2);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 10,
                column: "Value",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 11,
                column: "Value",
                value: 2);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 12,
                column: "Value",
                value: 3);

            migrationBuilder.UpdateData(
                table: "Lookups",
                keyColumn: "LookupId",
                keyValue: 13,
                column: "Value",
                value: 4);

            migrationBuilder.CreateIndex(
                name: "IX_Lookups_LookupCategoryId_Value",
                table: "Lookups",
                columns: new[] { "LookupCategoryId", "Value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CityId",
                table: "Addresses",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CountryId",
                table: "Addresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_StateId",
                table: "Addresses",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_Cities_StateId_Code",
                table: "Cities",
                columns: new[] { "StateId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Code",
                table: "Countries",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_States_CountryId_Code",
                table: "States",
                columns: new[] { "CountryId", "Code" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Cities_CityId",
                table: "Addresses",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "CityId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Countries_CountryId",
                table: "Addresses",
                column: "CountryId",
                principalTable: "Countries",
                principalColumn: "CountryId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_States_StateId",
                table: "Addresses",
                column: "StateId",
                principalTable: "States",
                principalColumn: "StateId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Cities_CityId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Countries_CountryId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_States_StateId",
                table: "Addresses");

            migrationBuilder.DropTable(
                name: "Cities");

            migrationBuilder.DropTable(
                name: "States");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropIndex(
                name: "IX_Lookups_LookupCategoryId_Value",
                table: "Lookups");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_CityId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_CountryId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_StateId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "Lookups");

            migrationBuilder.DropColumn(
                name: "CityId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "CountryId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "StateId",
                table: "Addresses");
        }
    }
}
