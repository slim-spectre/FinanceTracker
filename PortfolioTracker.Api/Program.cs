using System.Net;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .Build();

var services = new ServiceCollection();

string GetConnectionString()
{
    var url = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
              ?? configuration.GetConnectionString("DefaultConnection");

    if (string.IsNullOrEmpty(url)) throw new Exception("Connection string is missing!");

    if (url.StartsWith("postgresql://"))
    {
        var uri = new Uri(url);
        var userInfo = uri.UserInfo.Split(':');
        return $"Host={uri.Host};Port={uri.Port};Username={userInfo[0]};Password={userInfo[1]};Database={uri.AbsolutePath.Substring(1)};SSL Mode=Require;Trust Server Certificate=true;";
    }
    return url;
}

services.AddDbContext<FinanceDbContext>(options => 
{
    options.UseNpgsql(GetConnectionString());
});

services.AddSingleton<IConfiguration>(configuration);
services.AddTransient<RequestHandler>();
services.AddSingleton<PriceMonitor>();

var serviceProvider = services.BuildServiceProvider();

using (var scope = serviceProvider.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
    try
    {
        Console.WriteLine("Applying database migrations...");
        db.Database.Migrate();
        Console.WriteLine("Migrations applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error applying migrations: {ex.Message}");
    }
}

HttpListener server = new HttpListener();
string port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
server.Prefixes.Add($"http://+:{port}/");
server.Start();
Console.WriteLine($"Server started on port {port}");

var priceMonitor = serviceProvider.GetRequiredService<PriceMonitor>();
_ = Task.Run(async () => await priceMonitor.StartTracking());

while (true)
{
    var data = await server.GetContextAsync();
    var reqHandler = serviceProvider.GetRequiredService<RequestHandler>();
    _ = Task.Run(() => reqHandler.ProcessRequestAsync(data));
}