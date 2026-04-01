const fs = require("fs");
const fetch = require("node-fetch");

// DEIN API-Football Key aus GitHub Secrets
const API_KEY = process.env.API_FOOTBALL_KEY;

// FIFA WM 2026 Einstellungen
const LEAGUE_ID = 1; // Hier ggf. richtige League-ID prüfen
const SEASON = 2026;

// Funktion, um API-Daten abzurufen
async function fetchAPI(url) {
  const res = await fetch(url, {
    headers: { "x-apisports-key": API_KEY }
  });
  if (!res.ok) throw new Error(`Fehler beim Abruf: ${res.status}`);
  return res.json();
}

// Fixtures vereinfachen
function simplifyFixtures(data) {
  return data.map(f => ({
    date: f.fixture.date,
    timestamp: f.fixture.timestamp,
    status: f.fixture.status.short,
    home: f.teams.home.name,
    away: f.teams.away.name,
    homeCode: f.teams.home.code,
    awayCode: f.teams.away.code,
    goalsHome: f.goals.home,
    goalsAway: f.goals.away
  }));
}

// Tabellen vereinfachen
function simplifyStandings(data) {
  return data[0].league.standings.map(group =>
    group.map(team => ({
      rank: team.rank,
      name: team.team.name,
      points: team.points,
      goalsDiff: team.goalsDiff,
      played: team.all.played,
      win: team.all.win,
      draw: team.all.draw,
      lose: team.all.lose
    }))
  );
}

// Hauptfunktion
async function updateData() {
  try {
    console.log("⏳ Lade Daten von API-Football...");

    // Fixtures
    const fixturesRes = await fetchAPI(
      `https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${SEASON}`
    );

    // Standings / Tabellen
    const standingsRes = await fetchAPI(
      `https://v3.football.api-sports.io/standings?league=${LEAGUE_ID}&season=${SEASON}`
    );

    // Daten zusammenführen
    const data = {
      updated: new Date().toISOString(),
      fixtures: simplifyFixtures(fixturesRes.response),
      standings: simplifyStandings(standingsRes.response)
    };

    // JSON speichern
    fs.writeFileSync("wm2026.json", JSON.stringify(data, null, 2));
    console.log("✅ JSON erfolgreich erstellt: wm2026.json");

  } catch (err) {
    console.error("❌ Fehler beim Update:", err.message);
  }
}

// Script starten
updateData();
