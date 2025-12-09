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
    }
}
