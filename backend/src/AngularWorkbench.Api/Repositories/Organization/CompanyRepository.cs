using AngularWorkbench.Api.Data;
using AngularWorkbench.Api.Domain.Entities;
using AngularWorkbench.Api.Repositories.Organization.Interfaces;

namespace AngularWorkbench.Api.Repositories.Organization
{
    public class CompanyRepository
        : RepositoryBase<Company>, ICompanyRepository
    {
        public CompanyRepository(AppDbContext context)
            : base(context)
        {
        }
    }
}
