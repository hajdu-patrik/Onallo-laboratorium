var builder = DistributedApplication.CreateBuilder(args);

// 1. Az Adatbázis (SQL Server) definiálása
// Az Aspire letölti a Docker image-et és elindítja
var sql = builder.AddSqlServer("sql")
                 .AddDatabase("AutoServiceDb");

// 2. A Backend (WebAPI) beállítása és összekötése az adatbázissal
var apiService = builder.AddProject<Projects.AutoService_ApiService>("apiservice")
                        .WithReference(sql);

// 3. A Frontend (React + Vite) beállítása és összekötése a Backenddel
var webUi = builder.AddNpmApp("webui", "../AutoService.WebUI", "dev")
                   .WithReference(apiService)
                   .WithEnvironment("VITE_API_URL", apiService.GetEndpoint("https"))
                   .WithHttpEndpoint(env: "PORT")
                   .WithExternalHttpEndpoints();

builder.Build().Run();