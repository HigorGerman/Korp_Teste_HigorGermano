using Invoice.API.Repositories;
using Invoice.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configura porta de execução para HTTP 5002
builder.WebHost.UseUrls("http://localhost:5002");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// CORS para http://localhost:4200
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Injeção de Dependência do Repositório e Serviço (Arquitetura 3 Camadas)
builder.Services.AddScoped<INotaFiscalRepository, NotaFiscalRepository>();
builder.Services.AddScoped<INotaFiscalService, NotaFiscalService>();

// Registro do HttpClient para o StockIntegrationService
builder.Services.AddHttpClient<IStockIntegrationService, StockIntegrationService>((serviceProvider, client) =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var stockUrl = configuration["StockApiUrl"] ?? "http://localhost:5001";
    client.BaseAddress = new Uri(stockUrl.EndsWith('/') ? stockUrl : $"{stockUrl}/");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();