
using System.Net;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();


var services = new ServiceCollection();
services.AddSingleton<IConfiguration>(configuration);
var optionsBuilder = new DbContextOptionsBuilder<FinanceDbContext>();
optionsBuilder.UseNpgsql(
    configuration.GetConnectionString("DefaultConnection"),
    npgsqlOptions => {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null);
    });
services.AddSingleton(optionsBuilder.Options);
services.AddTransient<RequestHandler>();
services.AddSingleton<PriceMonitor>(sp => {
    var options = sp.GetRequiredService<DbContextOptions<FinanceDbContext>>();
    var config = sp.GetRequiredService<IConfiguration>();
    return new PriceMonitor(options, config);
});

var serviceProvider = services.BuildServiceProvider();
HttpListener server = new HttpListener();
string port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
server.Prefixes.Add($"http://+:{port}/");
server.Start();

var priceMonitor = serviceProvider.GetRequiredService<PriceMonitor>();
_ = Task.Run(async () => await priceMonitor.StartTracking());

while (true)
{
    var data = await server.GetContextAsync();
    var reqHandler = serviceProvider.GetRequiredService<RequestHandler>();
    _ = Task.Run(() => reqHandler.ProcessRequestAsync(data));
}