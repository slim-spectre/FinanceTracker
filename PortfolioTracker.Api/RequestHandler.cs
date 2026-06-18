using System.Net;
using System.Text;
using System.Text.Json;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;

public class RequestHandler
{
    private readonly FinanceDbContext _db;

    public RequestHandler(FinanceDbContext db)
    {
        _db = db;
    }

    public async Task ProcessRequestAsync(HttpListenerContext context)
    {
        Console.WriteLine($"{context.Request.HttpMethod} {context.Request.Url?.AbsolutePath} (Thread: {Environment.CurrentManagedThreadId})");
        
        HttpListenerResponse response = context.Response;
        
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (context.Request.HttpMethod == "OPTIONS")
        {
            response.StatusCode = 200;
            response.Close();
            return; 
        }

    
        if (context.Request.Url?.AbsolutePath == "/api/register" && context.Request.HttpMethod == "POST")
        {
            try
            {
                using var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding);
                string jsonBody = await reader.ReadToEndAsync();

                var dto = JsonSerializer.Deserialize<RegisterDto>(jsonBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                if (dto == null)
                {
                    SendTextResponse(response, 400, "Invalid JSON body");
                    return;
                }

                var validator = new RegisterValidator();
                ValidationResult validationResult = validator.Validate(dto);
                
                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage);
                    SendJsonResponse(response, 400, errors);
                    return;
                }

                bool isLoginTaken = await _db.Users.AnyAsync(x => x.Login == dto.Login);
                if (isLoginTaken)
                {
                    SendTextResponse(response, 409, "User with this login already exist");
                    return;
                }

            
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                var newUser = new User
                {
                    Login = dto.Login,
                    PasswordHash = passwordHash,
                    FullName = dto.FullName,
                    CreatedAt = DateTime.UtcNow,
                    RoleId = 2 
                };

                _db.Users.Add(newUser);
                await _db.SaveChangesAsync();

                SendTextResponse(response, 201, "Registered successfully!");
                return;
            }
            catch (Exception ex)
            {
                SendTextResponse(response, 500, $"I am a stupid programmer sorry: {ex.Message}");
                return;
            }
        }

        SendTextResponse(response, 200, "Hello from async C# server");
    }

    private void SendTextResponse(HttpListenerResponse response, int statusCode, string message)
    {
        response.StatusCode = statusCode;
        byte[] buffer = Encoding.UTF8.GetBytes(message);
        response.ContentLength64 = buffer.Length;
        response.OutputStream.Write(buffer, 0, buffer.Length);
        response.Close();
    }

    private void SendJsonResponse(HttpListenerResponse response, int statusCode, object data)
    {
        response.StatusCode = statusCode;
        response.ContentType = "application/json";
        string json = JsonSerializer.Serialize(data);
        byte[] buffer = Encoding.UTF8.GetBytes(json);
        response.ContentLength64 = buffer.Length;
        response.OutputStream.Write(buffer, 0, buffer.Length);
        response.Close();
    }
}