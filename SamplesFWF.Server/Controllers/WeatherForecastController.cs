using Microsoft.AspNetCore.Mvc;
using SamplesFWF.Library.Services;
using SamplesFWF.Library.Models;
using SamplesFWF.Domain.Models;
using SamplesFWF.Library.Mapping;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Globalization;

namespace SamplesFWF.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private readonly IWeatherService _weatherService;

        public WeatherForecastController(IWeatherService weatherService)
        {
            _weatherService = weatherService;
        }

        [HttpGet]
        public async Task<PagedResult<ForecastDto>> Get([FromQuery] int page = 0, [FromQuery] int pageSize = 10, [FromQuery] string? q = null)
        {
            var result = await _weatherService.GetForecastsAsync(page: page, pageSize: pageSize, query: q);

            var dtoItems = result.Items.Select(ForecastMapper.ToDto).ToList();

            return new PagedResult<ForecastDto>(dtoItems, result.TotalCount);
        }

        [HttpPost]
        public async Task<ActionResult<ForecastDto>> Post([FromBody] ForecastDto dto)
        {
            if (dto == null) return BadRequest();

            // Let model validation (data annotations) run first.
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var domain = ForecastMapper.ToDomain(dto);

            try
            {
                var created = await _weatherService.CreateForecastAsync(domain);

                var createdDto = ForecastMapper.ToDto(created);

                // Return 201 Created. You may adjust Location to point to a GET-by-date endpoint if added.
                return CreatedAtAction(nameof(Get), null, createdDto);
            }
            catch (InvalidOperationException ex)
            {
                // already exists
                ModelState.AddModelError("date", ex.Message);
                return Conflict(new ValidationProblemDetails(ModelState) { Status = 409 });
            }
        }

        [HttpPut]
        public async Task<ActionResult<ForecastDto>> Put([FromBody] ForecastDto dto)
        {
            if (dto == null) return BadRequest();

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var domain = ForecastMapper.ToDomain(dto);

            var updated = await _weatherService.UpdateForecastAsync(domain);
            if (updated == null)
            {
                ModelState.AddModelError(string.Empty, $"Forecast for date {dto.Date} was not found.");
                return NotFound(new ValidationProblemDetails(ModelState) { Status = 404 });
            }

            var updatedDto = ForecastMapper.ToDto(updated);

            return Ok(updatedDto);
        }
    }
}
