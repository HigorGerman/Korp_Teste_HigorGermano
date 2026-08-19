using Stock.API.Repositories;
using Stock.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configura a porta HTTP 5001 para a Stock.API
builder.WebHost.UseUrls("http://localhost:5001");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Registrar Repositórios e Serviços em 3 Camadas
builder.Services.AddScoped<IProdutoRepository, ProdutoRepository>();
builder.Services.AddScoped<IIdempotenciaRepository, IdempotenciaRepository>();

builder.Services.AddScoped<IProdutoService, ProdutoService>();
builder.Services.AddScoped<IStockAiService, StockAiService>();
builder.Services.AddScoped<IIdempotencyService, IdempotencyService>();

// Configura CORS para permitir chamadas do frontend Angular em http://localhost:4200
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
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