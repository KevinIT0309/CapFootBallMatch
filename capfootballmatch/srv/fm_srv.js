const cds = require('@sap/cds');
const { calculatePoints } = require('./utils.js');
class FMService extends cds.ApplicationService {
  init() {
    const { Bets, Goals, Users, Scores, Teams } = this.entities;

    /// Bets events
    this.before('CREATE', 'Bets', async req => {
      // only allow to create when the match in this bet not yet take place
      console.log("EVENTS: before CREATE Bets");
      const { match_ID } = req.data;

      if (await hasMatchTaken(req, match_ID)) {
        return req.error(400, 'Match has already taken place');
      }
    });

    this.before('UPDATE', 'Bets', async req => {
      // only allow to create when the match in this bet not yet take place
      console.log("EVENTS: before UPDATE Bets " + JSON.stringify(req.data));
      const bet_ID = req.params[0];
      const bet = await cds.tx(req).run(SELECT.one.from('football.match.Bets').where({ ID: bet_ID }));

      if (!bet) {
        return req.error(400, 'Bet does not exist');
      }

      if (await hasMatchTaken(req, bet.match_ID)) {
        return req.error(400, 'Match has already taken place');
      }
    });

    this.on('TotalBetPointsReceived', async req => {
      console.log("EVENTS: TotalBetPointsReceived");
      const { userID } = req.data;
      const result = await cds.tx(req).run(
        SELECT.one`SUM(points) as totalScores`
          .from('football.match.Scores')
          .where({ user_ID: userID })
      );
      return result && result.totalScores ? result.totalScores : 0;
    })

    this.on('GetUserInfo', req => {
      const user = {
        "id": req.user.id
      }

      return user;
    });

    this.on('getMatchBetResults', async req => {
      console.log("EVENTS: getMatchBetResults getMatchBetResults getMatchBetResults getMatchBetResults");
      const { userID } = req.data;
      const db = this.transaction(req);

      const matches = await cds.tx(req).run(SELECT.from('football.match.Matches'));

      const teams = await cds.tx(req).run(SELECT.from('football.match.Teams'));

      const bets = await cds.tx(req).run(SELECT.from('football.match.Bets').where({ user_ID: userID }));

      const betMap = bets.reduce((map, bet) => {
        map[bet.match_ID] = bet;
        return map;
      }, {});

      const teamMap = teams.reduce((map, team) => {
        map[team.team_id] = team;
        return map;
      }, {});

      const results = matches.map(match => {
        const bet = betMap[match.match_id] || {};
        const team = teamMap[match.team_win_ID] || {};
        return {
          ...match,
          team_win_ID_bet: bet.team_win_ID,
          team_win_Name: team.team_name,
          isDraw: bet.isDraw
        };
      });

      return results;
    });

    /// Matches events
    this.before('CREATE', 'Matches', async req => {
      await hasMatchByUnique(req);

      req.data.match_id = req.data.match_id || await getNextId(req)
    })


    this.before('UPDATE', 'Matches', async req => {
      console.log("EVENTS: before UPDATE Matchs: " + JSON.stringify(req.data));
      if(req.data.status == 3) {
        console.log("Match done" );
        await updateScore(req); // make score for all bets
      }
      
    });

    this.after('READ', 'LeaderBoards', async req => {
      console.log("EVENTS: before READS LeaderBoards");

    });

    this.after('READ', 'BetStatistics', async req => {
      console.log("EVENTS: before READS BetStatistics");

    });
    
    return super.init();


  }
}

async function hasMatchByUnique(req) {

  const match_time = req.data.match_time;
  const team1_ID = req.data.team1_ID;
  const team2_ID = req.data.team2_ID;

  const match = await cds.tx(req).run(SELECT.one.from('football.match.Matches').where({ match_time, team1_ID, team2_ID }));
  if (match) {
    return req.error(409, 'Match exist');
  }
}

async function getNextId(req) {
  const result = await cds.tx(req).run(SELECT.one.from('football.match.Matches').orderBy({ match_id: 'desc' }));
  return result ? result.match_id + 1 : 1
}


const hasMatchTaken = async (req, match_ID) => {
  const match = await cds.tx(req).run(SELECT.one.from('football.match.Matches').where({ match_id: match_ID }));
  if (!match) {
    return req.error(400, 'Match does not exist');
  }
  const now = new Date();
  return match.isOver;//new Date(match.match_time) <= now;
}

const updateScore = async (req) => {
  try {
    const { match_id } = req.params[0];
    const bets = await cds.tx(req).run(SELECT.from('football.match.Bets').where({ match_ID: match_id }));
    const match = await cds.tx(req).run(SELECT.one.from('football.match.Matches').where({ match_id: match_id }));
    const tx = cds.transaction(req);
    await tx.run(DELETE.from('football.match.Scores').where({ match_ID: match_id }));
    for (const bet of bets) {
      const now = new Date();
      const score = {
        createdAt: now,
        modifiedAt: now,
        createdBy: "anonymous",
        modifiedBy: "anonymous",
        user_ID: bet.user_ID,
        match_ID: match_id,
        points: calculatePoints(bet, req.data, match)
      };
      console.log("EVENTS: score " + JSON.stringify(score));
      await tx.run(INSERT.into('football.match.Scores').entries(score));
    }
  } catch (error) {
    console.error('Error when update scores' + error);
  }
}

module.exports = FMService;