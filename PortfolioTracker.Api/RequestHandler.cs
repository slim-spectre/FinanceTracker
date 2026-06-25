using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
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
        ResponseHandler responseHandler = new ResponseHandler();
        var registerValidator = new RegisterValidator();
        var loginValidator = new LoginValidator();
        JwtHandler jwtHandler = new JwtHandler();
        
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");


       
        if (context.Request.Url?.AbsolutePath == "/api/portfolio" && context.Request.HttpMethod == "GET")
        {
            try
            {
             
                string? authHeader = context.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    responseHandler.SendTextResponse(response, 401, "Unauthorized:gavno token");
                    return;
                }

               
                string token = authHeader.Substring(7);

              
                var principal = jwtHandler.ValidateToken(token);
                if (principal == null)
                {
                    responseHandler.SendTextResponse(response, 401, "Unauthorizedd: very bad token man its old like my grand grand dad");
                    return;
                }

                var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    responseHandler.SendTextResponse(response, 400, "Bad Request: not that id of user in token maaaan");
                    return;
                }

                var userPortfolio = await _db.Portfolios
                    .Where(p => p.UserId == userId)
                    .ToListAsync();

                responseHandler.SendJsonResponse(response, 200, userPortfolio);
                return;
            }
            catch (Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"Internal Server Error: {ex.Message}");
                return;
            }
        }
        
        if (context.Request.HttpMethod == "OPTIONS")
        {
            response.StatusCode = 200;
            response.Close();
            return; 
        }

        if(context.Request.Url?.AbsolutePath == "/api/login" && context.Request.HttpMethod == "POST")
        {
            try
            {
                using var reader = new StreamReader(context.Request.InputStream,context.Request.ContentEncoding);
                string jsonBody = await reader.ReadToEndAsync();

                var dto = JsonSerializer.Deserialize<LoginDto>(jsonBody,new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (dto == null)
                {
                    responseHandler.SendTextResponse(response,400,"Invalid JSON body");
                    return;
                }

                ValidationResult validationResult = loginValidator.Validate(dto);
                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage);
                    responseHandler.SendJsonResponse(response, 400, errors);
                    return;
                }


                var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(x => x.Login == dto.Login);
                if(user == null)
                {
                    responseHandler.SendTextResponse(response,401,"Not correct login or passwords");
                    return;
                }

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
                if(isPasswordValid == false)
                {
                    responseHandler.SendTextResponse(response,401,"Not correct login or passwords");
                    return;
                }


                var token = jwtHandler.GenerateJwtToken(user);
                responseHandler.SendJsonResponse(response, 200, new {token = token});
                return;


            }
            catch (Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"I am a VERY stupid programmer sorry: {ex.Message}");
                return;
            }
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
                    responseHandler.SendTextResponse(response, 400, "Invalid JSON body");
                    return;
                }

                ValidationResult validationResult = registerValidator.Validate(dto);
                
                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage);
                    responseHandler.SendJsonResponse(response, 400, errors);
                    return;
                }

                bool isLoginTaken = await _db.Users.AnyAsync(x => x.Login == dto.Login);
                if (isLoginTaken)
                {
                    responseHandler.SendTextResponse(response, 409, "User with this login already exist");
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

                responseHandler.SendTextResponse(response, 201, "Registered successfully!");
                return;
            }
            catch (Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"I am a stupid programmer sorry: {ex.Message}");
                return;
            }
        }

        responseHandler.SendTextResponse(response, 200, "Hello from async C# server");
    }

    
}