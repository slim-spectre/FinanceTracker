
using System.Net;
RequestHandler reqHandler = new RequestHandler();
HttpListener server = new  HttpListener(); 
server.Prefixes.Add("http://localhost:5000/");
server.Start();

while (true)
{
    var data = await server.GetContextAsync();
    _ = Task.Run(() => reqHandler.ProcessRequestAsync(data));
}