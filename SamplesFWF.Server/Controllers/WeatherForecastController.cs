using Microsoft.AspNetCore.Mvc;
using SamplesFWF.Library.Services;
using SamplesFWF.Library.Models;
using SamplesFWF.Domain.Models;
using System.Linq;
using System.Threading.Tasks;

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
    }
}
