using Microsoft.EntityFrameworkCore;

public class FinanceDbContext : DbContext
{
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Watchlist> Watchlists => Set<Watchlist>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<WatchlistAsset> WatchlistAssets => Set<WatchlistAsset>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=portfolio_db;Username=postgres;Password=26030891");
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