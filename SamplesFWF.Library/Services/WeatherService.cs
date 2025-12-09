using SamplesFWF.Domain.Models;
using SamplesFWF.Domain.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SamplesFWF.Library.Services
{
    public interface IWeatherService
    {
        Task<IEnumerable<Forecast>> GetForecastsAsync();
    }

    public class WeatherService : IWeatherService
    {
        private readonly AppDbContext _db;

        public WeatherService(AppDbContext db)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
        }

        public async Task<IEnumerable<Forecast>> GetForecastsAsync()
        {
            return await _db.Forecasts
                .AsNoTracking()
                .OrderBy(f => f.Date)
                .ToListAsync();
        }
    }
}
