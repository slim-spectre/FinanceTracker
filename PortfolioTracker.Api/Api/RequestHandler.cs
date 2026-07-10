using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
public class RequestHandler
{
    private readonly DbContextOptions<FinanceDbContext> _options;

    public RequestHandler(DbContextOptions<FinanceDbContext> options)
    {
        _options = options;
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
        using var _db = new FinanceDbContext(_options);
        ResponseHandler responseHandler = new ResponseHandler();
        var registerValidator = new RegisterValidator();
        var loginValidator = new LoginValidator();
        var buyAssetValidator = new BuyAssetValidator();
        var sellAssetValidator = new SellAssetValidator();

        JwtHandler jwtHandler = new JwtHandler();
        

        if(context.Request.Url?.AbsolutePath == "/api/assets" && context.Request.HttpMethod == "GET")
        {
            try
            {
                var assetPrices = await _db.MarketPrices.OrderBy(x => x.Ticker).ToListAsync();

                var result = assetPrices.Select(a => new
                {
                    Id = a.Id,
                    AssetId = a.AssetId,
                    Ticker = a.Ticker,   
                    Name = a.Name,       
                    CurrentPrice = a.CurrentPrice, 
                    LastUpdated = a.LastUpdated,
                    CoinIcon = a.CoinIcon,
                    PriceChangePercentage24h = a.PriceChangePercentage24h
                });

                responseHandler.SendJsonResponse(response,200,new {assets = result});
                return;
            }
            catch(Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"Internal Server Error: {ex.Message}");
                return;
            }
        }

        if(context.Request.Url?.AbsolutePath == "/api/transactions" 
        && context.Request.HttpMethod == "GET")
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


                var transactionsWithAssets = await (
                from tx in _db.Transactions
                join asset in _db.MarketPrices on tx.AssetId equals asset.AssetId
                where tx.UserId == userId
                orderby tx.Date descending 
                select new TransactionResponseDto
                {
                    Id = tx.Id,
                    UserId = tx.UserId,
                    AssetId = tx.AssetId,
                    AssetTicker = asset.Ticker, 
                    AssetName = asset.Name,
                    AssetIcon = asset.CoinIcon,
                    Type = tx.Type.ToString().ToUpper(),
                    Quantity = tx.Quantity,
                    Price = tx.Price,
                    TotalAmount = tx.TotalAmount,
                    Date = tx.Date,
                    Fees = tx.Fees,
                    Notes = tx.Notes
                }
                ).ToListAsync();

                responseHandler.SendJsonResponse(response, 200, new { transactions = transactionsWithAssets });
                return;

            }
            catch(Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"Internal Server Error: {ex.Message}");
                return;
            }
        }

        if(context.Request.Url?.AbsolutePath == "/api/portfolio/sell"
        && context.Request.HttpMethod == "POST")
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


                using var reader = new StreamReader(context.Request.InputStream,context.Request.ContentEncoding);
                string jsonBody = await reader.ReadToEndAsync();

                var dto = JsonSerializer.Deserialize<SellAssetDto>(jsonBody,new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (dto == null)
                {
                    responseHandler.SendTextResponse(response,400,"Invalid JSON body");
                    return;
                }

                ValidationResult validationResult = sellAssetValidator.Validate(dto);
                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage);
                    responseHandler.SendJsonResponse(response, 400, errors);
                    return;
                }
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if(user == null)
                {
                    responseHandler.SendTextResponse(response,400,"liar");
                    return;
                }
                
                var existingAsset = await _db.Portfolios.FirstOrDefaultAsync(x => x.UserId == userId && 
                x.AssetId == dto.AssetId);
                if(existingAsset == null || existingAsset.Quantity < dto.Quantity)
                {
                    responseHandler.SendJsonResponse(response,400,"Not exististing asset or not enough");
                    return;
                }
                var revenue = dto.Quantity * dto.Price;
                user.Balance += revenue;
                decimal profitOrLoss = (dto.Price - existingAsset.AveragePrice) * dto.Quantity;
                if(existingAsset.Quantity - dto.Quantity == 0)
                {
                    _db.Portfolios.Remove(existingAsset);
                }
                else
                {
                    existingAsset.Quantity -= dto.Quantity;
                    existingAsset.TotalInvested = existingAsset.Quantity * existingAsset.AveragePrice;
                }
                var tx = new Transaction
                {
                    UserId = userId,
                    AssetId = dto.AssetId,
                    Type = TransactionType.Sell,
                    Quantity = dto.Quantity,
                    Price = dto.Price,
                    TotalAmount = dto.Quantity * dto.Price,
                    Date = DateTime.UtcNow,
                    Fees = 0,
                    Notes = $"Sold via API. Realized Profit/Loss: {profitOrLoss}$"
                };
                _db.Transactions.Add(tx);
                await _db.SaveChangesAsync();
                responseHandler.SendJsonResponse(response, 200, new { message = "Asset was sooled successfully" });
                return;

            }
            catch ( Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"Internal Server Error: {ex.Message}");
                return;
            }
        }

        if(context.Request.Url?.AbsolutePath == "/api/portfolio/buy" 
        && context.Request.HttpMethod == "POST")
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


                using var reader = new StreamReader(context.Request.InputStream,context.Request.ContentEncoding);
                string jsonBody = await reader.ReadToEndAsync();

                var dto = JsonSerializer.Deserialize<BuyAssetDto>(jsonBody,new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });



                if (dto == null)
                {
                    responseHandler.SendTextResponse(response,400,"Invalid JSON body");
                    return;
                }

                ValidationResult validationResult = buyAssetValidator.Validate(dto);
                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage);
                    responseHandler.SendJsonResponse(response, 400, errors);
                    return;
                }


                var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if(user == null)
                {
                    responseHandler.SendTextResponse(response, 400, "you are not you motherfucker");
                    return;
                }
                var totalCost = dto.Quantity * dto.Price;
                if(user.Balance < totalCost)
                {
                    responseHandler.SendTextResponse(response, 400, "Not enough money, go to work bro");
                    return;
                }
                user.Balance -= totalCost;
                var existingAsset = await _db.Portfolios
                .FirstOrDefaultAsync(p => p.UserId == userId && p.AssetId == dto.AssetId);
                if(existingAsset == null)
                {
                    var newPortfolioItem = new Portfolio
                    {
                        UserId = userId,
                        AssetId = dto.AssetId,
                        Quantity = dto.Quantity,
                        AveragePrice = dto.Price,
                        TotalInvested = dto.Quantity * dto.Price
                    };
                    _db.Portfolios.Add(newPortfolioItem);
                }
                else
                {
                    existingAsset.Quantity += dto.Quantity;
                    existingAsset.TotalInvested += (dto.Quantity * dto.Price);
                    existingAsset.AveragePrice = existingAsset.TotalInvested / existingAsset.Quantity;
                }
                var tx = new Transaction
                {
                    UserId = userId,
                    AssetId = dto.AssetId,
                    Type = TransactionType.Buy,
                    Quantity = dto.Quantity,
                    Price = dto.Price,
                    TotalAmount = dto.Quantity * dto.Price,
                    Date = DateTime.UtcNow,
                    Fees = 0,
                    Notes = "Bought via API"
                };
                _db.Transactions.Add(tx);
                await _db.SaveChangesAsync();
                responseHandler.SendJsonResponse(response, 200, new { message = "Asset was bought successfully" });
                return;


            }catch (Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"Internal Server Error: {ex.Message}");
                return;
            }
        }
       
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

                var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

                var userPortfolio = await _db.Portfolios
                    .Where(p => p.UserId == userId)
                    .ToListAsync();
                var pricesDict = await _db.MarketPrices.ToDictionaryAsync(x => x.AssetId, x => x.CurrentPrice);

                decimal totalPortfolioValue = 0;
                decimal totalInvested = 0;
                var assetsResult = new List<object>();



                foreach (var item in userPortfolio)
                {
                    decimal currentPrice = pricesDict.TryGetValue(item.AssetId, out var price) ? price : item.AveragePrice;

                    var assetInfo = await _db.MarketPrices.FirstOrDefaultAsync(x => x.AssetId == item.AssetId);
                    string coinIcon = assetInfo?.CoinIcon ?? "";
                    string assetTicker = assetInfo?.Ticker ?? "UNKNOWN";
                    string assetName = assetInfo?.Name ?? "";

                    decimal currentValue = item.Quantity * currentPrice;
                    decimal unrealizedPnL = (currentPrice - item.AveragePrice) * item.Quantity;
                    
                    decimal roiPercentage = item.AveragePrice > 0 
                        ? ((currentPrice - item.AveragePrice) / item.AveragePrice) * 100 
                        : 0;

                    
                    totalPortfolioValue += currentValue;
                    totalInvested += item.TotalInvested;

                    assetsResult.Add(new
                    {
                        AssetId = item.AssetId,
                        AssetTicker = assetTicker,
                        AssetName = assetName,   
                        CoinIcon = coinIcon,
                        Quantity = item.Quantity,
                        AveragePrice = item.AveragePrice,
                        CurrentPrice = currentPrice,
                        CurrentValue = currentValue,
                        UnrealizedPnL = unrealizedPnL,
                        RoiPercentage = Math.Round(roiPercentage, 2)
                });
            }
            decimal cashBalance = user?.Balance ?? 0;
            decimal netWorth = cashBalance + totalPortfolioValue;
            decimal totalUnrealizedPnL = totalPortfolioValue - totalInvested;

            var responseObj = new
            {
                NetWorth = netWorth,
                CashBalance = cashBalance,
                TotalPortfolioValue = totalPortfolioValue,
                TotalUnrealizedPnL = totalUnrealizedPnL,
                Assets = assetsResult
            };
            responseHandler.SendJsonResponse(response, 200, responseObj);
            return;
            }
            catch (Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"Internal Server Error: {ex.Message}");
                return;
            }
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

        if (context.Request.Url?.AbsolutePath == "/api/watchlist" && context.Request.HttpMethod == "GET")
        {
            try
            {
                string? authHeader = context.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    responseHandler.SendJsonResponse(response, 401, new { error = "Unauthorized: gavno token" });
                    return;
                }

                string token = authHeader.Substring(7);
                var principal = jwtHandler.ValidateToken(token);
                if (principal == null)
                {
                    responseHandler.SendJsonResponse(response, 401, new { error = "Unauthorized: token is old" });
                    return;
                }

                var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    responseHandler.SendJsonResponse(response, 400, new { error = "Bad Request: invalid user id" });
                    return;
                }

                var watchlistItems = await (
                    from wa in _db.WatchlistAssets
                    join w in _db.Watchlists on wa.WatchlistId equals w.Id
                    join asset in _db.MarketPrices on wa.AssetId equals asset.AssetId
                    where w.UserId == userId
                    select new
                    {
                        assetId = asset.AssetId, 
                        ticker = asset.Ticker,
                        name = asset.Name,
                        currentPrice = asset.CurrentPrice,
                        coinIcon = asset.CoinIcon,
                        priceChangePercentage24h = asset.PriceChangePercentage24h
                    }
                ).ToListAsync();

                var responseData = new Dictionary<string, object> { { "watchlist", watchlistItems } };
                responseHandler.SendJsonResponse(response, 200, responseData);
                return;
            }
            catch (Exception ex)
            {
                responseHandler.SendJsonResponse(response, 500, new { error = ex.Message, inner = ex.InnerException?.Message });
                return;
            }
        }

        if (context.Request.Url?.AbsolutePath == "/api/watchlist/add" && context.Request.HttpMethod == "POST")
        {
            try
            {
                string? authHeader = context.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    responseHandler.SendJsonResponse(response, 401, new { error = "Unauthorized" });
                    return;
                }

                string token = authHeader.Substring(7);
                var principal = jwtHandler.ValidateToken(token);
                if (principal == null || !int.TryParse(principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out int userId))
                {
                    responseHandler.SendJsonResponse(response, 401, new { error = "Unauthorized" });
                    return;
                }

                using var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding);
                string jsonBody = await reader.ReadToEndAsync();
                
                var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (data == null || !data.TryGetValue("AssetId", out JsonElement assetIdElement))
                {
                    responseHandler.SendJsonResponse(response, 400, new { error = "Invalid JSON: AssetId is required" });
                    return;
                }

                int assetId = assetIdElement.ValueKind == JsonValueKind.String 
                    ? int.Parse(assetIdElement.GetString()!) 
                    : assetIdElement.GetInt32();

                var userWatchlist = await _db.Watchlists.FirstOrDefaultAsync(w => w.UserId == userId);
                if (userWatchlist == null)
                {
                    userWatchlist = new Watchlist { UserId = userId };
                    _db.Watchlists.Add(userWatchlist);
                    await _db.SaveChangesAsync(); 
                }

                bool alreadyAdded = await _db.WatchlistAssets.AnyAsync(wa => wa.WatchlistId == userWatchlist.Id && wa.AssetId == assetId);
                if (alreadyAdded)
                {
                    responseHandler.SendJsonResponse(response, 400, new { error = "Asset already in watchlist" });
                    return;
                }

                var newWatchlistAsset = new WatchlistAsset
                {
                    WatchlistId = userWatchlist.Id,
                    AssetId = assetId
                };
                _db.WatchlistAssets.Add(newWatchlistAsset);
                await _db.SaveChangesAsync();

                responseHandler.SendJsonResponse(response, 200, new { message = "Asset added to watchlist successfully" });
                return;
            }
            catch (Exception ex)
            {
                responseHandler.SendJsonResponse(response, 500, new { error = ex.Message });
                return;
            }
        }

        if (context.Request.Url?.AbsolutePath == "/api/watchlist/remove" && context.Request.HttpMethod == "DELETE")
        {
            try
            {
                string? authHeader = context.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    responseHandler.SendTextResponse(response, 401, "Unauthorized");
                    return;
                }

                string token = authHeader.Substring(7);
                var principal = jwtHandler.ValidateToken(token);
                if (principal == null || !int.TryParse(principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out int userId))
                {
                    responseHandler.SendTextResponse(response, 401, "Unauthorized");
                    return;
                }

                using var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding);
                string jsonBody = await reader.ReadToEndAsync();
                var data = JsonSerializer.Deserialize<Dictionary<string, int>>(jsonBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                if (data == null || !data.TryGetValue("AssetId", out int assetId))
                {
                    responseHandler.SendTextResponse(response, 400, "Invalid JSON: AssetId is required");
                    return;
                }

                var userWatchlist = await _db.Watchlists.FirstOrDefaultAsync(w => w.UserId == userId);
                if (userWatchlist == null)
                {
                    responseHandler.SendTextResponse(response, 404, "Watchlist not found");
                    return;
                }

                var itemToRemove = await _db.WatchlistAssets.FirstOrDefaultAsync(wa => wa.WatchlistId == userWatchlist.Id && wa.AssetId == assetId);
                if (itemToRemove == null)
                {
                    responseHandler.SendTextResponse(response, 404, "Asset not found in watchlist");
                    return;
                }

                _db.WatchlistAssets.Remove(itemToRemove);
                await _db.SaveChangesAsync();

                responseHandler.SendJsonResponse(response, 200, new { message = "Asset removed from watchlist" });
                return;
            }
            catch (Exception ex)
            {
                responseHandler.SendTextResponse(response, 500, $"Internal Server Error: {ex.Message}");
                return;
            }
        }
        responseHandler.SendTextResponse(response, 404, "API endpoint not found");
    }

    
}