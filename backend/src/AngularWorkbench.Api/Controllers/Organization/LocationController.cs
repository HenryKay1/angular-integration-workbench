
using AngularWorkbench.Api.Models.DTOS.Organization;
using AngularWorkbench.Api.Models.DTOS.Requests;
using AngularWorkbench.Api.Services.Organization.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AngularWorkbench.Api.Controllers.Organization
{
    [ApiController]
    [Route("api/locations")]
    public sealed class LocationsController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public LocationsController(
            ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet("{locationId:int}")]
        public async Task<ActionResult<LocationDto>> GetByIdAsync(
            int locationId,
            CancellationToken cancellationToken)
        {
            var location =
                await _locationService.GetByIdAsync(
                    locationId,
                    cancellationToken);

            if (location is null)
            {
                return NotFound();
            }

            return Ok(location);
        }

        [HttpGet("company/{companyId:int}")]
        public async Task<ActionResult<IReadOnlyList<LocationDto>>> GetByCompanyAsync(
            int companyId,
            CancellationToken cancellationToken)
        {
            var locations =
                await _locationService.GetByCompanyIdAsync(
                    companyId,
                    cancellationToken);

            return Ok(locations);
        }

        [HttpGet("{locationId:int}/details")]
        public async Task<ActionResult<LocationDetailsDto>> GetDetailsAsync(
            int locationId,
            CancellationToken cancellationToken)
        {
            var location =
                await _locationService.GetDetailsAsync(
                    locationId,
                    cancellationToken);

            if (location is null)
            {
                return NotFound();
            }

            return Ok(location);
        }

        [HttpPost]
        public async Task<ActionResult<LocationDto>> CreateAsync(
            LocationRequest request,
            CancellationToken cancellationToken)
        {
            var location =
                await _locationService.CreateAsync(
                    request,
                    cancellationToken);

            return CreatedAtAction(
                nameof(GetByIdAsync),
                new { locationId = location.LocationId },
                location);
        }

        [HttpPut("{locationId:int}")]
        public async Task<IActionResult> UpdateAsync(
            int locationId,
            LocationRequest request,
            CancellationToken cancellationToken)
        {
            var updated =
                await _locationService.UpdateAsync(
                    locationId,
                    request,
                    cancellationToken);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{locationId:int}")]
        public async Task<IActionResult> DeleteAsync(
            int locationId,
            CancellationToken cancellationToken)
        {
            var deleted =
                await _locationService.DeleteAsync(
                    locationId,
                    cancellationToken);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}