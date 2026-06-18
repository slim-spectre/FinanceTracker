
using System.Net;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddDbContext<FinanceDbContext>();
services.AddTransient<RequestHandler>();

var serviceProvider = services.BuildServiceProvider();

HttpListener server = new  HttpListener(); 
server.Prefixes.Add("http://localhost:5000/");
server.Start();

while (true)
{
    var data = await server.GetContextAsync();
    var reqHandler = serviceProvider.GetRequiredService<RequestHandler>();
    _ = Task.Run(() => reqHandler.ProcessRequestAsync(data));
}