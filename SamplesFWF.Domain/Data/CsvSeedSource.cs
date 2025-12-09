using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using CsvHelper;
using CsvHelper.Configuration;
using SamplesFWF.Domain.Models;

namespace SamplesFWF.Domain.Data
{
    public static class CsvSeedSource
    {
        private const string ResourceName = "SamplesFWF.Domain.Data.forecasts.csv";

        /// <summary>
        /// Reads embedded CSV resource and returns Forecast instances.
        /// Expected CSV header: Date,TemperatureC,Summary
        /// Date parsing uses invariant culture (ISO yyyy-MM-dd recommended).
        /// </summary>
        public static List<Forecast> ReadForecastsFromEmbeddedCsv()
        {
            var asm = Assembly.GetExecutingAssembly();
            using var stream = asm.GetManifestResourceStream(ResourceName);
            if (stream == null)
                return new List<Forecast>();

            using var reader = new StreamReader(stream);
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                HeaderValidated = null,
                BadDataFound = null,
                PrepareHeaderForMatch = args => args.Header?.Trim()
            };

            using var csv = new CsvReader(reader, config);
            var records = csv.GetRecords<CsvRecord>().ToList();

            return records.Select(r => new Forecast
            {
                Date = r.Date,
                TemperatureC = r.TemperatureC,
                Summary = r.Summary
            }).ToList();
        }

        private class CsvRecord
        {
            public DateTime Date { get; set; }
            public int TemperatureC { get; set; }
            public string? Summary { get; set; }
        }
    }
}