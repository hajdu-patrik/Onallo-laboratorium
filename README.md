![.NET](https://img.shields.io/badge/Backend-.NET_10-512BD4?style=flat&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/Language-C%23_15-239120?style=flat&logo=csharp&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=flat&logo=vite&logoColor=white)
![SQL Server](https://img.shields.io/badge/Database-SQL_Server_2022-CC292B?style=flat&logo=microsoftsqlserver&logoColor=white)
![Aspire](https://img.shields.io/badge/Orchestration-.NET_Aspire-512BD4?style=flat&logo=dotnet&logoColor=white)
![EF Core](https://img.shields.io/badge/ORM-EF_Core-512BD4?style=flat&logo=nuget&logoColor=white)

# AutoService - Időpontfoglaló és Erőforrás-kezelő Rendszer

Ez a projekt egy teljes stack alkalmazás, amely ASP.NET Core WebAPI-t használ a backendhez, React + TypeScript-et a frontendhez, és Microsoft SQL Server 2022-t az adatbázishoz. Az egész rendszer egy .NET Aspire alapú orkesztrációs rétegen fut, amely megkönnyíti a fejlesztést, a telemetria gyűjtést és a konténerizációt.

---

## Projekt Inicializálása (Visual Code-ban)

### A Solution létrehozása

```Bash
dotnet new sln -n AutoService
```

A Solution fájl a logikai konténer. Ez fogja össze a backend, a frontend és az orkesztrációs projekteket, hogy a fordító (MSBuild) egy egységként kezelje őket.

### A .NET Aspire alapok (Orkesztráció és Telemetria)

```Bash
dotnet new aspire-apphost -n AutoService.AppHost
dotnet new aspire-servicedefaults -n AutoService.ServiceDefaults
```

Az AppHost a karmester. Amikor elindítjuk az alkalmazást, ez a projekt indul el először, és ez húzza fel a Docker konténereket (pl. az MSSQL-t) és indítja el a WebAPI-t.

A ServiceDefaults egy megosztott könyvtár, ami beállítja az OpenTelemetry-t (logolás, metrikák, tracing) és a Health Check-eket.

### A Backend (WebAPI) létrehozása

```Bash
dotnet new webapi -n AutoService.ApiService
```

Létrehozunk egy letisztult, modern ASP.NET Core REST API projektet (Minimal API vagy Controller alapokon). Ez lesz az üzleti logika központja és az MCP szerverünk helye, amely az adatbázissal kommunikál.

### A Frontend (React + TS) létrehozása

```Bash
npm create vite@latest AutoService.WebUI -- --template react-ts
cd AutoService.WebUI
npm install
```

Létrehozunk egy React alkalmazást TypeScript támogatással, a Vite építőeszközt használva.
Majd telepítjük a szükséges npm csomagokat, hogy a frontendünk készen álljon a fejlesztésre.

## Tailwind CSS integráció

```Bash
cd AutoService.WebUI
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

Hozzuk létre a `postcss.config.js` fájlt az `AutoService.WebUI` gyökerében:

```js
export default {
	plugins: {
		'@tailwindcss/postcss': {},
	},
}
```

Majd a `src/index.css` elejére tegyük be:

```css
@import "tailwindcss";
```

Ezzel a Tailwind utility osztályok azonnal használhatók lesznek a React komponensekben.

### Projektek hozzáadása a Solution-höz

```Bash
dotnet sln add AutoService.AppHost/AutoService.AppHost.csproj
dotnet sln add AutoService.ServiceDefaults/AutoService.ServiceDefaults.csproj
dotnet sln add AutoService.ApiService/AutoService.ApiService.csproj
```

---

## Csomagok (NuGet) és Hivatkozások beállítása
Ahhoz, hogy a komponensek "lássák" egymást és a szükséges technológiákat használni tudják, referenciákat kell beállítanunk.

### Függőségek (References) beállítása

```Bash
dotnet add AutoService.ApiService reference AutoService.ServiceDefaults
dotnet add AutoService.AppHost reference AutoService.ApiService
```

Az API megkapja a telemetria beállításokat a Defaults-ból.
Az AppHost "tudni fogja", hogy el kell indítania az ApiService-t.

### Aspire integrációs csomagok (AppHost)

```Bash
dotnet add AutoService.AppHost package Aspire.Hosting.SqlServer
dotnet add AutoService.AppHost package Aspire.Hosting.NodeJs
```

Képessé teszi az orkesztrátort, hogy Docker konténerben elindítson egy Microsoft SQL Server 2022-t, illetve hogy natívan elindítsa az npm run dev parancsot a React frontendünk számára.

### Entity Framework Core csomagok (ApiService)

```Bash
dotnet add AutoService.ApiService package Microsoft.EntityFrameworkCore.SqlServer
dotnet add AutoService.ApiService package Microsoft.EntityFrameworkCore.Design
dotnet add AutoService.ApiService package Microsoft.EntityFrameworkCore.Tools
```

Feltelepíti a Microsoft hivatalos ORM (Object-Relational Mapping) eszközét és a migrációkhoz szükséges tervezői csomagokat. Code-First megközelítést alkalmazunk! Azaz C# osztályokból generáljuk az adatbázis táblákat, így a verziókezelőben (Git) egyszerűbben követhető marad a séma minden változása.

---

## Aspire idnitása

```Bash
cd AutoService.AppHost
dotnet run
```