using AngularWorkbench.Api.Models.DTOS.Access;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Services.Organization.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AngularWorkbench.Api.Controllers.Access
{
    [ApiController]
    [Route("api/regions")]
    public sealed class RegionsController : ControllerBase
    {
        private readonly IRegionService _regionService;

        public RegionsController(
            IRegionService regionService)
        {
            _regionService = regionService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<RegionDto>>> GetActiveAsync(
            CancellationToken cancellationToken)
        {
            var regions =
                await _regionService.GetActiveAsync(
                    cancellationToken);

            return Ok(regions);
        }

        [HttpGet("{regionId:int}")]
        public async Task<ActionResult<RegionDto>> GetByIdAsync(
            int regionId,
            CancellationToken cancellationToken)
        {
            var region =
                await _regionService.GetByIdAsync(
                    regionId,
                    cancellationToken);

            if (region is null)
            {
                return NotFound();
            }

            return Ok(region);
        }

        [HttpGet("code/{code}")]
        public async Task<ActionResult<RegionDto>> GetByCodeAsync(
            string code,
            CancellationToken cancellationToken)
        {
            var region =
                await _regionService.GetByCodeAsync(
                    code,
                    cancellationToken);

            if (region is null)
            {
                return NotFound();
            }

            return Ok(region);
        }

        [HttpPost]
        public async Task<ActionResult<RegionDto>> CreateAsync(
            RegionRequest request,
            CancellationToken cancellationToken)
        {
            var region =
                await _regionService.CreateAsync(
                    request,
                    cancellationToken);

            return CreatedAtAction(
                nameof(GetByIdAsync),
                new { regionId = region.RegionId },
                region);
        }

        [HttpPut("{regionId:int}")]
        public async Task<IActionResult> UpdateAsync(
            int regionId,
            RegionRequest request,
            CancellationToken cancellationToken)
        {
            var updated =
                await _regionService.UpdateAsync(
                    regionId,
                    request,
                    cancellationToken);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{regionId:int}")]
        public async Task<IActionResult> DeactivateAsync(
            int regionId,
            CancellationToken cancellationToken)
        {
            var deactivated =
                await _regionService.DeactivateAsync(
                    regionId,
                    cancellationToken);

            if (!deactivated)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}