using System;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace SamplesFWF.Library.Models
{
    // Simple validation attribute to enforce yyyy-MM-dd date strings.
    public sealed class DateStringAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is null) return false;
            if (value is string s)
            {
                return DateTime.TryParseExact(s, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _);
            }
            return false;
        }

        public override string FormatErrorMessage(string name) =>
            $"{name} must be a date in yyyy-MM-dd format.";
    }

    public sealed class ForecastDto
    {
        [Required]
        [DateString(ErrorMessage = "Date must be in yyyy-MM-dd format.")]
        public string Date { get; init; } = string.Empty;

        [Range(-150, 150, ErrorMessage = "TemperatureC must be between -150 and 150.")]
        public int TemperatureC { get; init; }

        // calculated by server/client for convenience; not required in POST/PUT
        public int TemperatureF { get; init; }

        [StringLength(500, ErrorMessage = "Summary must be 500 characters or less.")]
        public string? Summary { get; init; }
    }
}