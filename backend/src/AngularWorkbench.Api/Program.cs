using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

const string AngularDevelopmentCorsPolicy = "AngularDevelopmentCorsPolicy";

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        AngularDevelopmentCorsPolicy,
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:4200",
                    "http://localhost:4201",
                    "http://localhost:4202",
                    "http://localhost:4203")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddApplicationDependencies();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(AngularDevelopmentCorsPolicy);
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .WithName("HealthCheck")
    .WithOpenApi();
app.MapControllers();
app.Run();

public partial class Program;
