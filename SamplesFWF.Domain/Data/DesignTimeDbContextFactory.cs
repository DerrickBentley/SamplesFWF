using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Sqlite; // Add this using directive

namespace SamplesFWF.Domain.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        // Use the same connection string you configured in Server appsettings.json.
        // Adjust path/name as needed.
        optionsBuilder.UseSqlite("Data Source=weather.db");

        return new AppDbContext(optionsBuilder.Options);
    }
}