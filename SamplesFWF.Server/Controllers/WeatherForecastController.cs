using Microsoft.AspNetCore.Mvc;
using SamplesFWF.Domain.Models;
using SamplesFWF.Library.Services;

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
        public async Task<IEnumerable<Forecast>> Get()
        {
            return await _weatherService.GetForecastsAsync();
        }
    }
}
