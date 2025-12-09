namespace SamplesFWF.Library.Models
{
    public sealed class ForecastDto
    {
        public string Date { get; init; } = string.Empty;
        public int TemperatureC { get; init; }
        public int TemperatureF { get; init; }
        public string? Summary { get; init; }
    }
}