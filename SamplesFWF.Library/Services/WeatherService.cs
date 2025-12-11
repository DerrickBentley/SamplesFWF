using SamplesFWF.Domain.Models;
using SamplesFWF.Domain.Data;
using SamplesFWF.Library.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SamplesFWF.Library.Services
{
    public interface IWeatherService
    {
        Task<PagedResult<Forecast>> GetForecastsAsync(int page, int pageSize, string? query = null);

        Task<Forecast> CreateForecastAsync(Forecast forecast);

        Task<Forecast?> UpdateForecastAsync(Forecast forecast);
    }

    public class WeatherService : IWeatherService
    {
        private readonly AppDbContext _db;

        public WeatherService(AppDbContext db)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
        }

        public async Task<PagedResult<Forecast>> GetForecastsAsync(int page, int pageSize, string? query = null)
        {
            if (page < 0) page = 0;
            if (pageSize <= 0) pageSize = 10;

            var baseQuery = _db.Forecasts
                .AsNoTracking()
                .OrderBy(f => f.Date);

            if (string.IsNullOrWhiteSpace(query))
            {
                var total = await baseQuery.CountAsync();
                var items = await baseQuery.Skip(page * pageSize).Take(pageSize).ToListAsync();
                return new PagedResult<Forecast>(items, total);
            }

            // Simple demo-friendly search: perform in-memory filtering for date/summary/temperature matching.
            // For large datasets you should translate search to SQL predicates or add indexed search fields.
            var q = query.Trim().ToLowerInvariant();
            var filtered = baseQuery.AsEnumerable().Where(f =>
                f.Date.ToString("yyyy-MM-dd").ToLowerInvariant().Contains(q) ||
                (f.Summary ?? string.Empty).ToLowerInvariant().Contains(q) ||
                f.TemperatureC.ToString().Contains(q) ||
                f.TemperatureF.ToString().Contains(q)
            );

            var totalFiltered = filtered.Count();
            var itemsFiltered = filtered.Skip(page * pageSize).Take(pageSize).ToList();
            return new PagedResult<Forecast>(itemsFiltered, totalFiltered);
        }

        public async Task<Forecast> CreateForecastAsync(Forecast forecast)
        {
            if (forecast == null) throw new ArgumentNullException(nameof(forecast));

            // normalize date to date-only
            forecast.Date = forecast.Date.Date;

            var exists = await _db.Forecasts.AnyAsync(f => f.Date == forecast.Date);
            if (exists)
            {
                throw new InvalidOperationException($"A forecast for date {forecast.Date:yyyy-MM-dd} already exists.");
            }

            _db.Forecasts.Add(forecast);
            await _db.SaveChangesAsync();

            return forecast;
        }

        public async Task<Forecast?> UpdateForecastAsync(Forecast forecast)
        {
            if (forecast == null) throw new ArgumentNullException(nameof(forecast));

            // normalize date to date-only
            var targetDate = forecast.Date.Date;

            var existing = await _db.Forecasts.FirstOrDefaultAsync(f => f.Date == targetDate);
            if (existing == null) return null;

            // update mutable properties
            existing.TemperatureC = forecast.TemperatureC;
            existing.Summary = forecast.Summary;

            await _db.SaveChangesAsync();

            return existing;
        }
    }
}
