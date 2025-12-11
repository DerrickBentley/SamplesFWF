using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SamplesFWF.Domain.Data;
using SamplesFWF.Domain.Models;
using SamplesFWF.Library.Services;
using Xunit;

namespace SamplesFWF.Tests
{
    public class WeatherServiceTests
    {
        private static AppDbContext CreateContext(string dbName = null)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetForecastsAsync_NoQuery_ReturnsPaged()
        {
            using var db = CreateContext();
            for (var i = 0; i < 15; i++)
            {
                db.Forecasts.Add(new Forecast { Date = DateTime.Today.AddDays(i), TemperatureC = i, Summary = $"S{i}" });
            }
            await db.SaveChangesAsync();

            var svc = new WeatherService(db);
            var res = await svc.GetForecastsAsync(0, 10, null);

            res.TotalCount.Should().Be(15);
            res.Items.Should().HaveCount(10);
            res.Items.First().Date.Date.Should().Be(DateTime.Today.Date);
        }

        [Fact]
        public async Task GetForecastsAsync_Query_Filters()
        {
            using var db = CreateContext();
            db.Forecasts.Add(new Forecast { Date = DateTime.Parse("2025-12-11"), TemperatureC = 10, Summary = "rainy day" });
            db.Forecasts.Add(new Forecast { Date = DateTime.Parse("2025-12-12"), TemperatureC = 20, Summary = "sunny" });
            await db.SaveChangesAsync();

            var svc = new WeatherService(db);
            var res = await svc.GetForecastsAsync(0, 10, "rain");

            res.TotalCount.Should().Be(1);
            res.Items.Single().Summary.Should().Be("rainy day");
        }

        [Fact]
        public async Task CreateForecastAsync_AddsAndReturns()
        {
            using var db = CreateContext();
            var svc = new WeatherService(db);

            var f = new Forecast { Date = DateTime.Parse("2025-12-20"), TemperatureC = 5, Summary = "chilly" };
            var created = await svc.CreateForecastAsync(f);

            created.Should().NotBeNull();
            created.Date.Should().Be(f.Date.Date);
            (await db.Forecasts.CountAsync()).Should().Be(1);
        }

        [Fact]
        public async Task CreateForecastAsync_Duplicate_ThrowsInvalidOperationException()
        {
            using var db = CreateContext();
            var date = DateTime.Parse("2025-12-20").Date;
            db.Forecasts.Add(new Forecast { Date = date, TemperatureC = 1, Summary = "exists" });
            await db.SaveChangesAsync();

            var svc = new WeatherService(db);
            await Assert.ThrowsAsync<InvalidOperationException>(() => svc.CreateForecastAsync(new Forecast { Date = date, TemperatureC = 2, Summary = "dup" }));
        }

        [Fact]
        public async Task UpdateForecastAsync_UpdatesExisting_ReturnsUpdated()
        {
            using var db = CreateContext();
            var date = DateTime.Parse("2025-12-21").Date;
            db.Forecasts.Add(new Forecast { Date = date, TemperatureC = 1, Summary = "old" });
            await db.SaveChangesAsync();

            var svc = new WeatherService(db);
            var updated = await svc.UpdateForecastAsync(new Forecast { Date = date, TemperatureC = 9, Summary = "new" });

            updated.Should().NotBeNull();
            updated!.TemperatureC.Should().Be(9);
            updated.Summary.Should().Be("new");
        }

        [Fact]
        public async Task UpdateForecastAsync_NotFound_ReturnsNull()
        {
            using var db = CreateContext();
            var svc = new WeatherService(db);
            var res = await svc.UpdateForecastAsync(new Forecast { Date = DateTime.Parse("2026-01-01"), TemperatureC = 0 });
            res.Should().BeNull();
        }
    }
}