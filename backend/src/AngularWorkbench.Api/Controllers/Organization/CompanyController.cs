using AngularWorkbench.Api.Models.DTOS.Organization;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Services.Organization.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AngularWorkbench.Api.Controllers.Organization
{
    [ApiController]
    [Route("api/companies")]
    public sealed class CompaniesController : ControllerBase
    {
        private readonly ICompanyService _companyService;

        public CompaniesController(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        [HttpGet("{companyId:int}")]
        public async Task<ActionResult<CompanyDto>> GetByIdAsync(
            int companyId,
            CancellationToken cancellationToken)
        {
            var company = await _companyService.GetByIdAsync(
                companyId,
                cancellationToken);

            if (company is null)
            {
                return NotFound();
            }

            return Ok(company);
        }

        [HttpGet("{companyId:int}/details")]
        public async Task<ActionResult<CompanyDetailsDto>> GetCompanyDetailsAsync(
            int companyId,
            CancellationToken cancellationToken)
        {
            var company = await _companyService.GetCompanyDetailsAsync(
                companyId,
                cancellationToken);

            if (company is null)
            {
                return NotFound();
            }

            return Ok(company);
        }

        [HttpPost]
        public async Task<ActionResult<CompanyDto>> CreateAsync(
            CompanyRequest request,
            CancellationToken cancellationToken)
        {
            var company = await _companyService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetByIdAsync),
                new { companyId = company.CompanyId },
                company);
        }

        [HttpPut("{companyId:int}")]
        public async Task<IActionResult> UpdateAsync(
            int companyId,
            CompanyRequest request,
            CancellationToken cancellationToken)
        {
            var updated = await _companyService.UpdateAsync(
                companyId,
                request,
                cancellationToken);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{companyId:int}")]
        public async Task<IActionResult> DeleteAsync(
            int companyId,
            CancellationToken cancellationToken)
        {
            var deleted = await _companyService.DeleteAsync(
                companyId,
                cancellationToken);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
