using AngularWorkbench.Api.Repositories;
using AngularWorkbench.Api.Repositories.Access;
using AngularWorkbench.Api.Repositories.Access.Interfaces;
using AngularWorkbench.Api.Repositories.Interfaces;
using AngularWorkbench.Api.Repositories.Organization;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;
using AngularWorkbench.Api.Repositories.Reference;
using AngularWorkbench.Api.Repositories.Reference.Interfaces;
using AngularWorkbench.Api.Services.Access;
using AngularWorkbench.Api.Services.Access.Interfaces;
using AngularWorkbench.Api.Services.Organization;
using AngularWorkbench.Api.Services.Organization.Interfaces;

namespace AngularWorkbench.Api.Extensions
{
    public static class ServiceRegistration
    {
        public static IServiceCollection AddApplicationDependencies(
            this IServiceCollection services)
        {
            services.AddScoped<ILocationRepository, LocationRepository>();
            services.AddScoped<IRegionRepository, RegionRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ICompanyRepository, CompanyRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<ILookupRepository, LookupRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IUserRoleRepository, UserRoleRepository>();

            services.AddScoped<ICompanyService, CompanyService>();
            services.AddScoped<ILocationService, LocationService>();
            services.AddScoped<IRegionService, RegionService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IUserRoleService, UserRoleService>();


            services.AddScoped<IUnitOfWork, UnitOfWork>();


            return services;
        }

        
    }
}
