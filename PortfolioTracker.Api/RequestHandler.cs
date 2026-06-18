using System.Net;
using System.Text;

public class RequestHandler
{
    private readonly FinanceDbContext _db;

    public RequestHandler(FinanceDbContext db)
    {
        _db = db;
    }
    public async Task ProcessRequestAsync(HttpListenerContext context)
    {
        Console.WriteLine(context.Request.HttpMethod);
        Console.WriteLine(context.Request.Url?.AbsolutePath);
        System.Console.WriteLine(Environment.CurrentManagedThreadId);
        HttpListenerResponse response = context.Response;

        response.Headers.Add("Access-Control-Allow-Origin","*");
        response.Headers.Add("Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers",
        "Content-type, Authorization");


        if(context.Request.HttpMethod == "OPTIONS")
        {
            response.StatusCode = 200;
            response.Close();
        }
        else
        {
            var message = "Hello from async C# server";
            byte[] buffer = Encoding.UTF8.GetBytes(message);
            await response.OutputStream.WriteAsync(buffer,0,buffer.Length);
            response.Close();
        }
    }
}