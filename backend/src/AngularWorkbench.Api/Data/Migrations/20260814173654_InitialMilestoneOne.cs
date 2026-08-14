using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AngularWorkbench.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialMilestoneOne : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppUsers",
                columns: table => new
                {
                    AppUserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUsers", x => x.AppUserId);
                });

            migrationBuilder.CreateTable(
                name: "ProductTypes",
                columns: table => new
                {
                    ProductTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductTypes", x => x.ProductTypeId);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProjectNumber = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.ProjectId);
                    table.ForeignKey(
                        name: "FK_Projects_AppUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUsers",
                        principalColumn: "AppUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductTypeId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_Products_ProductTypes_ProductTypeId",
                        column: x => x.ProductTypeId,
                        principalTable: "ProductTypes",
                        principalColumn: "ProductTypeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Schedules",
                columns: table => new
                {
                    ScheduleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schedules", x => x.ScheduleId);
                    table.ForeignKey(
                        name: "FK_Schedules_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductModels",
                columns: table => new
                {
                    ProductModelId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ModelNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductModels", x => x.ProductModelId);
                    table.ForeignKey(
                        name: "FK_ProductModels_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductOptionGroups",
                columns: table => new
                {
                    ProductOptionGroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductOptionGroups", x => x.ProductOptionGroupId);
                    table.ForeignKey(
                        name: "FK_ProductOptionGroups_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LineItems",
                columns: table => new
                {
                    LineItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleId = table.Column<int>(type: "int", nullable: false),
                    ProductModelId = table.Column<int>(type: "int", nullable: true),
                    Tag = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LineItems", x => x.LineItemId);
                    table.ForeignKey(
                        name: "FK_LineItems_ProductModels_ProductModelId",
                        column: x => x.ProductModelId,
                        principalTable: "ProductModels",
                        principalColumn: "ProductModelId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LineItems_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductOptions",
                columns: table => new
                {
                    ProductOptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductOptionGroupId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductOptions", x => x.ProductOptionId);
                    table.ForeignKey(
                        name: "FK_ProductOptions_ProductOptionGroups_ProductOptionGroupId",
                        column: x => x.ProductOptionGroupId,
                        principalTable: "ProductOptionGroups",
                        principalColumn: "ProductOptionGroupId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LineItemSelections",
                columns: table => new
                {
                    LineItemSelectionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LineItemId = table.Column<int>(type: "int", nullable: false),
                    ProductOptionId = table.Column<int>(type: "int", nullable: false),
                    SelectedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LineItemSelections", x => x.LineItemSelectionId);
                    table.ForeignKey(
                        name: "FK_LineItemSelections_LineItems_LineItemId",
                        column: x => x.LineItemId,
                        principalTable: "LineItems",
                        principalColumn: "LineItemId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LineItemSelections_ProductOptions_ProductOptionId",
                        column: x => x.ProductOptionId,
                        principalTable: "ProductOptions",
                        principalColumn: "ProductOptionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "AppUsers",
                columns: new[] { "AppUserId", "CreatedUtc", "Email", "FirstName", "IsActive", "LastName" },
                values: new object[] { 1, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc), "avery.morgan@example.com", "Avery", true, "Morgan" });

            migrationBuilder.InsertData(
                table: "ProductTypes",
                columns: new[] { "ProductTypeId", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Packaged rooftop HVAC equipment.", "Rooftop Unit" },
                    { 2, "Indoor air handling equipment.", "Air Handler" },
                    { 3, "Heating and cooling heat pump equipment.", "Heat Pump" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "ProductId", "Description", "IsActive", "Name", "ProductTypeId" },
                values: new object[] { 1, "Configurable rooftop unit for commercial schedules.", true, "Commercial Packaged Rooftop Unit", 1 });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "ProjectId", "CreatedByUserId", "CreatedUtc", "CustomerName", "Location", "ModifiedUtc", "Name", "ProjectNumber", "Status" },
                values: new object[] { 1, 1, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc), "North Campus Facilities", "Chicago, IL", new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc), "North Campus Mechanical Upgrade", "NC-2026-014", "Draft" });

            migrationBuilder.InsertData(
                table: "ProductModels",
                columns: new[] { "ProductModelId", "Description", "IsActive", "ModelNumber", "ProductId" },
                values: new object[,]
                {
                    { 1, "90 MBH nominal capacity.", true, "RT-090", 1 },
                    { 2, "120 MBH nominal capacity.", true, "RT-120", 1 },
                    { 3, "150 MBH nominal capacity.", true, "RT-150", 1 }
                });

            migrationBuilder.InsertData(
                table: "ProductOptionGroups",
                columns: new[] { "ProductOptionGroupId", "Name", "ProductId", "SortOrder" },
                values: new object[,]
                {
                    { 1, "Heating", 1, 10 },
                    { 2, "Cooling", 1, 20 },
                    { 3, "Air", 1, 30 },
                    { 4, "Electrical Heat", 1, 40 }
                });

            migrationBuilder.InsertData(
                table: "Schedules",
                columns: new[] { "ScheduleId", "Description", "Name", "ProjectId", "SortOrder" },
                values: new object[] { 1, "Initial mechanical equipment schedule.", "Rooftop Unit Schedule", 1, 10 });

            migrationBuilder.InsertData(
                table: "LineItems",
                columns: new[] { "LineItemId", "ProductModelId", "Quantity", "ScheduleId", "Status", "Tag" },
                values: new object[] { 1, 2, 1, 1, "Configured", "RTU-1" });

            migrationBuilder.InsertData(
                table: "ProductOptions",
                columns: new[] { "ProductOptionId", "IsActive", "Name", "ProductOptionGroupId", "SortOrder", "Value" },
                values: new object[,]
                {
                    { 1, true, "Heating Type", 1, 10, "Gas" },
                    { 2, true, "Heating Type", 1, 20, "Electric" },
                    { 3, true, "Voltage", 1, 30, "208/230V" },
                    { 4, true, "Voltage", 1, 40, "460V" },
                    { 5, true, "Coil", 1, 50, "2 Row" },
                    { 6, true, "Coil", 1, 60, "3 Row" },
                    { 7, true, "Cooling Type", 2, 10, "Standard" },
                    { 8, true, "Cooling Type", 2, 20, "High Efficiency" },
                    { 9, true, "Voltage", 2, 30, "208/230V" },
                    { 10, true, "Voltage", 2, 40, "460V" },
                    { 11, true, "Coil", 2, 50, "2 Row" },
                    { 12, true, "Coil", 2, 60, "3 Row" },
                    { 13, true, "Airflow", 3, 10, "Standard" },
                    { 14, true, "Airflow", 3, 20, "High Static" },
                    { 15, true, "Motor", 3, 30, "ECM" },
                    { 16, true, "Motor", 3, 40, "PSC" },
                    { 17, true, "Heat Size", 4, 10, "10 kW" },
                    { 18, true, "Heat Size", 4, 20, "15 kW" },
                    { 19, true, "Heat Size", 4, 30, "20 kW" }
                });

            migrationBuilder.InsertData(
                table: "LineItemSelections",
                columns: new[] { "LineItemSelectionId", "LineItemId", "ProductOptionId", "SelectedUtc" },
                values: new object[,]
                {
                    { 1, 1, 1, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, 1, 4, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, 1, 8, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, 1, 10, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, 1, 14, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, 1, 15, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, 1, 18, new DateTime(2026, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppUsers_Email",
                table: "AppUsers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LineItems_ProductModelId",
                table: "LineItems",
                column: "ProductModelId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItems_ScheduleId",
                table: "LineItems",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_LineItemSelections_LineItemId_ProductOptionId",
                table: "LineItemSelections",
                columns: new[] { "LineItemId", "ProductOptionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LineItemSelections_ProductOptionId",
                table: "LineItemSelections",
                column: "ProductOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductModels_ProductId_ModelNumber",
                table: "ProductModels",
                columns: new[] { "ProductId", "ModelNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductOptionGroups_ProductId_Name",
                table: "ProductOptionGroups",
                columns: new[] { "ProductId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductOptions_ProductOptionGroupId",
                table: "ProductOptions",
                column: "ProductOptionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductTypeId",
                table: "Products",
                column: "ProductTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTypes_Name",
                table: "ProductTypes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CreatedByUserId",
                table: "Projects",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_ProjectId",
                table: "Schedules",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LineItemSelections");

            migrationBuilder.DropTable(
                name: "LineItems");

            migrationBuilder.DropTable(
                name: "ProductOptions");

            migrationBuilder.DropTable(
                name: "ProductModels");

            migrationBuilder.DropTable(
                name: "Schedules");

            migrationBuilder.DropTable(
                name: "ProductOptionGroups");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "AppUsers");

            migrationBuilder.DropTable(
                name: "ProductTypes");
        }
    }
}
