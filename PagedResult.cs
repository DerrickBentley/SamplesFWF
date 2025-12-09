using System;
using System.Collections.Generic;
using System.Linq;

namespace SamplesFWF.Library.Models
{
    public sealed class PagedResult<T>
    {
        public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
        public int TotalCount { get; init; }

        public PagedResult() { }

        public PagedResult(IEnumerable<T> items, int totalCount)
        {
            Items = items?.ToList().AsReadOnly() ?? new List<T>().AsReadOnly();
            TotalCount = totalCount;
        }
    }
}