using Microsoft.EntityFrameworkCore;
using SamplesFWF.Domain.Models;

namespace SamplesFWF.Domain.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Forecast> Forecasts { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Forecast>(eb =>
        {
            eb.HasKey(f => f.Date); // If Date is unique for your domain; change as needed.
            eb.Property(f => f.Summary).HasMaxLength(256);
        });
    }
}