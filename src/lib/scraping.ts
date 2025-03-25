import { load } from "cheerio";
import { Id } from "../../convex/_generated/dataModel";

export const scraping = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);

  const html = await response.text();
  const $ = load(html);

  const winningText = $(".cb-scrcrd-status.cb-text-complete")
    .first()
    .text()
    .trim();
  console.log("winningTeam", winningText);

  const winningTeamMatch = winningText.match(/^(.+?)\s+won/i);
  const winningTeam = winningTeamMatch ? winningTeamMatch[1].trim() : null;

  const teamNames: string[] = ["#innings_1", "#innings_2"].map((selector) => {
    const headerSpans = $(`${selector} .cb-col.cb-col-100.cb-scrd-hdr-rw span`);
    return headerSpans.eq(0).text().trim();
  });

  const players: {
    id: string;
    urlname: string;
    name: string;
    possibleNames: string[];
    runs: number;
    wickets: number;
    catchCount: number;
    stumpingsCount: number;
    runOutsCount: number;
  }[] = [];

  const nameMap: Record<string, string> = {}; // playerId -> name
  const playerMap: Record<string, number> = {}; // playerId -> index in players
  const nameVariants: Record<string, Set<string>> = {}; // playerId -> Set of names

  ["#innings_1", "#innings_2"].forEach((selector) => {
    const playerAnchors = $(`${selector} .cb-scrd-itms a.cb-text-link`);
    playerAnchors.each((_, el) => {
      const href = $(el).attr("href") || "";
      const name = $(el).text().trim();

      const match = href.match(/\/profiles\/(\d+)\/(.+)/);
      if (match) {
        const id = match[1];
        const urlname = match[2];

        if (!(id in playerMap)) {
          playerMap[id] = players.length;
          nameMap[id] = name;
          nameVariants[id] = new Set([name]);
          players.push({
            id,
            urlname,
            name,
            possibleNames: [],
            runs: 0,
            wickets: 0,
            catchCount: 0,
            stumpingsCount: 0,
            runOutsCount: 0,
          });
        } else {
          nameVariants[id].add(name);
          if (name.length > nameMap[id].length) nameMap[id] = name;
        }
      }
    });
  });

  ["#innings_1", "#innings_2"].forEach((selector) => {
    const inningsSection = $(`${selector} .cb-ltst-wgt-hdr`).first();
    inningsSection.find(".cb-scrd-itms").each((_, el) => {
      const cols = $(el).find(".cb-col");
      const anchor = $(cols[0]).find("a.cb-text-link");
      const href = anchor.attr("href") || "";
      const match = href.match(/\/profiles\/(\d+)\//);
      const batterId = match ? match[1] : null;
      const dismissalText = $(cols[1]).text().trim();
      const runs = parseInt($(cols[2]).text().trim()) || 0;

      if (batterId && playerMap[batterId] !== undefined) {
        const player = players[playerMap[batterId]];
        player.runs += runs;

        // Catch
        const catchMatch = dismissalText.match(/^c\s+(.+?)\s+b/);
        if (catchMatch) {
          const catcherName = catchMatch[1].trim();
          const catcher = players.find((p) => p.name.includes(catcherName));
          if (catcher) catcher.catchCount += 1;
        }

        // Stumping
        const stumpedMatch = dismissalText.match(/^st\s+(.+?)\s+b/);
        if (stumpedMatch) {
          const stumperName = stumpedMatch[1].trim();
          const stumper = players.find((p) => p.name.includes(stumperName));
          if (stumper) stumper.stumpingsCount += 1;
        }

        // Run Out
        const runOutMatch = dismissalText.match(/run out \(([^)]+)\)/i);
        if (runOutMatch) {
          const names = runOutMatch[1]
            .split("/")
            .map((n) => n.trim())
            .filter(Boolean);
          names.forEach((roName) => {
            const fielder = players.find((p) => p.name.includes(roName));
            if (fielder) fielder.runOutsCount += 1;
          });
        }
      }
    });

    // Bowlers
    const bowlersSection = $(`${selector} .cb-ltst-wgt-hdr`).eq(1);
    bowlersSection.find(".cb-scrd-itms").each((_, el) => {
      const cols = $(el).find(".cb-col");
      const anchor = $(cols[0]).find("a.cb-text-link");
      const href = anchor.attr("href") || "";
      const match = href.match(/\/profiles\/(\d+)\//);
      const bowlerId = match ? match[1] : null;
      const wickets = parseInt($(cols[4]).text().trim()) || 0;

      if (bowlerId && playerMap[bowlerId] !== undefined) {
        players[playerMap[bowlerId]].wickets += wickets;
      }
    });
  });

  // Assign longest name and possibleNames
  players.forEach((p) => {
    p.name = nameMap[p.id];
    p.possibleNames = Array.from(nameVariants[p.id]);
  });

  return {
    winningTeam,
    teamNames,
    players,
  };
};

type ScrapedPlayer = {
  id: string;
  name: string;
  runs: number;
  wickets: number;
  catchCount: number;
  stumpingsCount: number;
  runOutsCount: number;
  possibleNames: string[];
};

type DbPlayer = {
  _id: Id<"players">;
  name: string;
};

export function mergeForFinalInsert(
  scraped: {
    winningTeam: string;
    teamNames: string[];
    players: ScrapedPlayer[];
  },
  dbData: {
    teams: {
      teamId: Id<"teams"> | undefined;
      teamName: string | undefined;
    }[];
    homeTeamPlayers: DbPlayer[];
    awayTeamPlayers: DbPlayer[];
  }
): {
  winningTeam: { teamId: Id<"teams"> | null; teamName: string };
  players: {
    playerId: Id<"players">;
    playerName: string;
    runs: number;
    wickets: number;
    catches: number;
    stumpings: number;
    runouts: number;
  }[];
} {
  const allDbPlayers = [...dbData.homeTeamPlayers, ...dbData.awayTeamPlayers];
  console.log("db", allDbPlayers);
  const players = scraped.players
    .map((scrapedPlayer) => {
      const cleanedNames = scrapedPlayer.possibleNames.map((name) =>
        name
          .replace(/\(.*?\)/g, "")
          .trim()
          .toLowerCase()
      );
      console.log("cleanNames", cleanedNames);
      const matchedDbPlayer = allDbPlayers.find((dbPlayer) =>
        cleanedNames.some((name) => dbPlayer.name.toLowerCase().includes(name))
      );

      if (!matchedDbPlayer) return null;

      return {
        playerId: matchedDbPlayer._id,
        playerName: matchedDbPlayer.name,
        runs: scrapedPlayer.runs,
        wickets: scrapedPlayer.wickets,
        catches: scrapedPlayer.catchCount,
        stumpings: scrapedPlayer.stumpingsCount,
        runouts: scrapedPlayer.runOutsCount,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const winningTeamEntry = dbData.teams.find(
    (team) =>
      team.teamName &&
      scraped.winningTeam.toLowerCase().includes(team.teamName.toLowerCase())
  );

  const winningTeam = {
    teamId: winningTeamEntry?.teamId ?? null,
    teamName: winningTeamEntry?.teamName ?? "",
  };

  return {
    winningTeam,
    players,
  };
}
