using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

public class FinanceDbContext : DbContext


{

    public FinanceDbContext(DbContextOptions<FinanceDbContext> options) : base(options)
    {
    }
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Watchlist> Watchlists => Set<Watchlist>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<WatchlistAsset> WatchlistAssets => Set<WatchlistAsset>();

    public DbSet<AssetMarketPrice> MarketPrices => Set<AssetMarketPrice>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        
        string connectionString = configuration.GetConnectionString("DefaultConnection");
        optionsBuilder.UseNpgsql(connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Role>().HasData(
            new Role {Id = 1, Name = "Admin"},
            new Role {Id = 2, Name = "User"}
        );
    }

}