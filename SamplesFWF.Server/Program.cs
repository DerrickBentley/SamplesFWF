using SamplesFWF.Library.Services;
using SamplesFWF.Domain.Data;
using SamplesFWF.Domain.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IWeatherService, WeatherService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Perform migrations and programmatic seeding at startup (runtime seeding).
using (var scope = app.Services.CreateScope())
 {
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<AppDbContext>();
    var logger = services.GetRequiredService<Microsoft.Extensions.Logging.ILoggerFactory>().CreateLogger("Seed");

    // Apply pending migrations (creates DB if it doesn't exist).
    db.Database.Migrate();

    // Try to seed from the Domain embedded CSV using CsvHelper.
    try
    {
        var csvForecasts = CsvSeedSource.ReadForecastsFromEmbeddedCsv();
        if (csvForecasts != null && csvForecasts.Count > 0)
        {
            logger.LogInformation("Seeding Forecasts from embedded CSV (count={Count})", csvForecasts.Count);
            foreach (var f in csvForecasts)
            {
                if (!db.Forecasts.Any(x => x.Date == f.Date))
                    db.Forecasts.Add(f);
            }
            db.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to seed from embedded CSV.");
    }
}

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
