using System;
using System.Globalization;
using SamplesFWF.Domain.Models;
using SamplesFWF.Library.Models;

namespace SamplesFWF.Library.Mapping
{
    public static class ForecastMapper
    {
        private const string DateFormat = "yyyy-MM-dd";

        public static ForecastDto ToDto(Forecast domain)
        {
            if (domain == null) return null!; // keep behavior explicit for callers
            return new ForecastDto
            {
                Date = domain.Date.ToString(DateFormat),
                TemperatureC = domain.TemperatureC,
                TemperatureF = domain.TemperatureF,
                Summary = domain.Summary
            };
        }

        public static Forecast ToDomain(ForecastDto dto)
        {
            if (dto == null) return null!;

            // Keep the same parsing behavior: exact format; callers should validate model state
            var parsedDate = DateTime.ParseExact(dto.Date, DateFormat, CultureInfo.InvariantCulture);
            return new Forecast
            {
                Date = parsedDate.Date,
                TemperatureC = dto.TemperatureC,
                Summary = dto.Summary
            };
        }
    }
}