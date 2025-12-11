using Microsoft.AspNetCore.Mvc;
using SamplesFWF.Library.Services;
using SamplesFWF.Library.Models;
using SamplesFWF.Domain.Models;
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

            var dtoItems = result.Items.Select(f => new ForecastDto
            {
                Date = f.Date.ToString("yyyy-MM-dd"),
                TemperatureC = f.TemperatureC,
                TemperatureF = f.TemperatureF,
                Summary = f.Summary
            }).ToList();

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

            // DTO Date validated by DateStringAttribute; parse with exact format.
            var parsedDate = DateTime.ParseExact(dto.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

            var domain = new Forecast
            {
                Date = parsedDate.Date,
                TemperatureC = dto.TemperatureC,
                Summary = dto.Summary
            };

            try
            {
                var created = await _weatherService.CreateForecastAsync(domain);

                var createdDto = new ForecastDto
                {
                    Date = created.Date.ToString("yyyy-MM-dd"),
                    TemperatureC = created.TemperatureC,
                    TemperatureF = created.TemperatureF,
                    Summary = created.Summary
                };

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

            var parsedDate = DateTime.ParseExact(dto.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

            var domain = new Forecast
            {
                Date = parsedDate.Date,
                TemperatureC = dto.TemperatureC,
                Summary = dto.Summary
            };

            var updated = await _weatherService.UpdateForecastAsync(domain);
            if (updated == null)
            {
                ModelState.AddModelError(string.Empty, $"Forecast for date {dto.Date} was not found.");
                return NotFound(new ValidationProblemDetails(ModelState) { Status = 404 });
            }

            var updatedDto = new ForecastDto
            {
                Date = updated.Date.ToString("yyyy-MM-dd"),
                TemperatureC = updated.TemperatureC,
                TemperatureF = updated.TemperatureF,
                Summary = updated.Summary
            };

            return Ok(updatedDto);
        }
    }
}
