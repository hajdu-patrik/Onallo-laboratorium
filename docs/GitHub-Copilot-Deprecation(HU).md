# GitHub Copilot kivezetése

| Mező | Érték |
| --- | --- |
| Állapot | Kivezetve (deprecated) |
| Döntés dátuma | 2026-09-09 |
| Archív branch | `deprecated/github-copilot` |
| Érintett terület | A repository GitHub Copilot instruction rétege |
| Megmaradó aktív réteg | A Claude réteg (`CLAUDE.md`, `**/CLAUDE.md`, `.claude/**`) |

## 1. Mi ez a branch

Ez a branch az ARSM repository GitHub Copilot harness-ének az archívuma. Minden olyan fájl itt
marad meg az utolsó működő állapotában, amely kizárólag azért létezett, hogy a Copilot ugyanúgy
viselkedjen, ahogy a Claude réteg már amúgy is előírja, együtt azzal az indoklással, amely a
használatát lezárta.

Az archívum azért készült, mert ez a réteg soha nem volt felesleges teher. Teljes értékű, működő
tükre volt a Claude harness-nek: ugyanazok az agent szerepek, ugyanaz a routing, ugyanazok a
gate feltételek, ugyanaz a UI/UX policy. Nyom nélküli törlés hónapok összehangolási munkáját dobná
el, és nem maradna magyarázat arra, hogy miért tűnt el a történetből egy második, teljesen
kidolgozott harness. Egy nevesített branchen megőrizve viszont semmibe nem kerül, és a döntés
visszafordítható marad.

Miután a réteg lekerül a `main`-ről, innen semmit nem tölt be egyetlen eszköz sem. Ez a branch
hivatkozási pont, nem futtatókörnyezet.

## 2. Miért kerül kivezetésre a réteg

Az ok nem technikai. A Copilot harness működött. Ami elromlott, az a mögötte lévő hozzáférési
modell: nagyjából egy év alatt négyszer változtak a feltételek, minden változás kevesebbet adott
ugyanazért a pénzért, és az utolsó változás után egy feladat költsége már a megkezdése előtt nem
volt megbecsülhető. Az a harness, amelyet nem lehet megfizethetően elérni, nem harness.

Az alábbi történet ennek a projektnek a tényleges használati előzménye.

### 1. szakasz. Diák előfizetés, flagship modellekkel

A munka a diák előfizetésen indult. Ez akkor még önmagában hozta a csúcsmodelleket: a Claude Opus
4.6 és a Codex 5.3 is választható és használható volt külön fizetős csomag nélkül. A repository
Copilot rétege erre az időszakra készült. Az agent definíciók, a routing szabályok és a gate
feltételek mind olyan modellt feltételeznek, amely a teljes instruction készletet képes egyben
kezelni, és ez a feltételezés akkor teljesült.

A csúcsmodelleket később kivették a diák előfizetésből. Maga az előfizetés megmaradt, de a benne
elérhető modellek már nem azok voltak, amelyekre a harness épült.

### 2. szakasz. A fizetős csomag és két jó hónap

A válasz az volt, hogy a korábbi képességet visszaadó csomag megfizetésre került: a havi 40 dolláros
plán. Két hónapon át ez jó megoldás volt. A korszak flagship modelljei, az Opus 4.7 és a GPT-5.5,
fix havidíj mellett voltak elérhetők, így egy munkamenet költsége előre ismert volt, hiszen egyszerűen
a havidíj egy hányada. A modellválasztást az vezérelhette, hogy a feladatnak mire van szüksége, nem
az, hogy a feladat mennyit fogyaszt.

A teljes történetben ez az egyetlen szakasz, ahol a gazdaságosság és a mérnöki szempont ugyanabba az
irányba mutatott, és két hónapig tartott.

### 3. szakasz. Váltás token alapú elszámolásra

A csomag ezután a fix havi hozzáférésről token alapú elszámolásra váltott. Ez az a változás, amely
aláásta a konstrukciót, mert egy feladat költségét a megkezdés előtt ismert értékből a befejezés után
kiderülő értékké tette. Egy ilyen repository nagy, állandóan jelen lévő instruction készletet hordoz:
gyökér útmutató, hat területi szabályfájl, tizenegy agent definíció, hét skill, és egy kötelező
workflow, amely szinte minden változtatást ezek közül többön is átvezet. Fix díj mellett ennek a
kontextusnak az újraolvasása ingyenes. Token alapú elszámolás mellett minden útvonal minden lépésén
újra ki van számlázva.

Az előfizetés ekkor lemondásra került, és a projekt két hónapon át egyáltalán nem használta a Copilot
réteget.

### 4. szakasz. Visszatérés, credit alapon, egy hónapra

A kéthónapos kihagyás után a csomag újra megvásárlásra került, ugyanazon a 40 dolláros áron, immár
creditben elszámolva. A keret 7 000 credit volt, amelyet a 40 dolláros szint token mennyiségének
nagyjából a kétszereseként hirdettek, tehát névlegesen körülbelül 80 dollárnyi használatként. Ahhoz
mérve, amit a creditek ténylegesen megvásároltak, a valós érték inkább 65 és 70 dollár között volt.
A névleges és a valós összeg közötti eltérés azonban nem ez volt a döntő probléma. A döntő probléma a
fogyás üteme volt.

| Tétel | Érték |
| --- | --- |
| Havidíj | 40 dollár |
| Kapott credit | 7 000 |
| Névleges érték a hirdetés szerint | a 40 dolláros szint kb. kétszerese, tehát nagyjából 80 dollár |
| Megfigyelt valós érték | körülbelül 65 és 70 dollár között |
| Kifogyás ideje | jóval az elszámolási időszak vége előtt |

A keret minden kipróbált használati minta mellett gyorsan elfogyott:

- A régebbi, olcsóbb GPT-5.5-nél maradva, a keret nyújtása érdekében. A creditek így is jóval az
  időszak vége előtt elfogytak, ami azt jelenti, hogy a hiány szerkezeti volt, nem a drága modellek
  utáni nyúlás következménye.
- Az aktuális generációt kipróbálva, tehát a GPT-5.6-ot, a Terrát és a Lunát. Mindegyik képes modell
  volt, és mindegyik olyan ütemben fogyasztotta a keretet, hogy bármilyen nem triviális feladat előtt
  előbb a maradék keretet kellett megnézni.
- Az Opus 5.0-t kipróbálva. Ugyanaz az eredmény, gyorsabban.

Ez az a pont, ahol a konstrukció használhatatlanná vált. A hibajelenség nem az volt, hogy egyszer
elfogytak a creditek. Az volt, hogy minden feladatot be kellett árazni, mielőtt el lehetett kezdeni,
és az a harness, amelynek a kötelező workflow-ja egy orchestratort, egy szakosodott agentet, egy
validátort, egy dokumentációs és egy kódelvi lépést fűz össze, nem futtatható olyan keretből, amelyet
lépésenként kell adagolni. A workflow arra a feltételezésre épül, hogy a megfelelő agentekre való
routing mindig helyes. A credit alapú elszámolás a routingot költségdöntéssé teszi, a feladatonként
meghozott költségdöntés pedig pontosan az a fajta rögtönzött mérlegelés, amelyet a repository
útmutatója kizár.

### A hozzáférési előzmény összefoglalása

| Szakasz | Hozzáférési modell | Elérhető modellek | Időtartam | Eredmény |
| --- | --- | --- | --- | --- |
| 1 | Diák előfizetés | Opus 4.6, Codex 5.3 | A kivonásig | A csúcsmodellek kikerültek a csomagból |
| 2 | Havi 40 dollár, fix | Opus 4.7, GPT-5.5 | 2 hónap | Jól működött |
| 3 | Token alapú elszámolás | nincs adat | 2 hónap, előfizetés nélkül | A feladatonkénti költség kiszámíthatatlanná vált |
| 4 | Havi 40 dollár, credit | GPT-5.5, GPT-5.6, Terra, Luna, Opus 5.0 | 1 hónap | A keret ismételten korán elfogyott |

## 3. Mi következik ebből

A Claude réteg marad az egyetlen aktív instruction réteg. Ez a döntés gyakorlati következménye, nem
új preferencia: a repository útmutatója eddig is önálló rétegként kezelte a kettőt, és ha az egyik
kivezetésre kerül, a másik egyszerűen egyedül marad.

A gyökér útmutatóban két érvényben lévő előírás veszíti el a párját, ezeket a repository tulajdonosának
érdemes átgondolnia, amikor a réteg lekerül a `main`-ről:

- Az instruction réteg szétválasztásáról szóló szabály, amely a Copilotot aktív rétegként írja le,
  amelyet a Claude `docs-sync` futáson kívül nem olvashat.
- A UI/UX policy szinkronizációs szabály, amely négy nevesített fájlpár szemantikai egyezőségét
  követeli meg a két felület között. Minden pár egyik fele mostantól ezen a branchen van.

Mindkettő dokumentációs szintű változtatás a `main`-en, és a tulajdonosra tartozik, nem erre az
archívumra.

## 4. Az archivált réteg tartalma

Huszonöt verziókövetett fájl alkotja a Copilot harness-t. Mindegyik kizárólag azért létezik, hogy a
Copilot azt a viselkedést kapja meg, amelyet a Claude réteg már definiál.

**Gyökér útmutató**

- `.github/copilot-instructions.md`

**Agent definíciók**

- `.github/agents/backend.agent.md`
- `.github/agents/coding-principles.agent.md`
- `.github/agents/docs-sync.agent.md`
- `.github/agents/e2e-playwright-test.agent.md`
- `.github/agents/frontend.agent.md`
- `.github/agents/http-endpoint-test.agent.md`
- `.github/agents/migration.agent.md`
- `.github/agents/orchestrator.agent.md`
- `.github/agents/sql-database-test.agent.md`
- `.github/agents/ui-ux-style-profile.agent.md`
- `.github/agents/validate.agent.md`

**Területi instruction fájlok**

- `.github/instructions/apiservice.instructions.md`
- `.github/instructions/apphost.instructions.md`
- `.github/instructions/scripts.instructions.md`
- `.github/instructions/servicedefaults.instructions.md`
- `.github/instructions/tests.instructions.md`
- `.github/instructions/webui.instructions.md`

**Skillek**

- `.github/skills/autoservice-coding-principles/SKILL.md`
- `.github/skills/autoservice-docs-sync/SKILL.md`
- `.github/skills/autoservice-e2e-playwright-test/SKILL.md`
- `.github/skills/autoservice-ef-migration/SKILL.md`
- `.github/skills/autoservice-http-endpoint-test/SKILL.md`
- `.github/skills/autoservice-sql-database-test/SKILL.md`
- `.github/skills/ui-ux-sync/SKILL.md`

A `.github/workflows/dotnet.yml` szándékosan nem szerepel ezen a listán. Az a folyamatos integrációs
pipeline, semmi köze a Copilothoz, és a `main`-en marad.

## 5. A réteg visszaállítása

Ha a hozzáférési modell újra vállalhatóvá válik, a réteg egyetlen checkout paranccsal visszahozható
az archivált útvonalakról:

```bash
git checkout deprecated/github-copilot -- .github/agents .github/instructions .github/skills .github/copilot-instructions.md
```

A visszaállított fájlok a Claude réteg 2026-09-09-i állapotát tükrözik. Amit a Claude réteg ez után a
dátum után kapott, azt egy `docs-sync` futással kell átvezetni, mielőtt a két felület újra
egyenértékűnek nevezhető.

## 6. Angol változat

Ugyanez a dokumentum angolul: [`GitHub-Copilot-Deprecation.md`](GitHub-Copilot-Deprecation.md).
