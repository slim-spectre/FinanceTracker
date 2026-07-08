
using System.Net;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();


var services = new ServiceCollection();
services.AddSingleton<IConfiguration>(configuration);
services.AddDbContext<FinanceDbContext>();
services.AddTransient<RequestHandler>();
services.AddSingleton<PriceMonitor>();

var serviceProvider = services.BuildServiceProvider();

HttpListener server = new  HttpListener(); 
server.Prefixes.Add("http://localhost:5000/");
server.Start();


var priceMonitor = serviceProvider.GetRequiredService<PriceMonitor>();
_ = Task.Run(async () => await priceMonitor.StartTracking());

while (true)
{
    var data = await server.GetContextAsync();
    var reqHandler = serviceProvider.GetRequiredService<RequestHandler>();
    _ = Task.Run(() => reqHandler.ProcessRequestAsync(data));
}