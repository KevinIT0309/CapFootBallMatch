const cds = require('@sap/cds');

class FMService extends cds.ApplicationService {
  init() {

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
      console.log("EVENTS: before UPDATE Bets ");
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

    /// Matches events
    this.before('CREATE', 'Matches', async req => {
      await hasMatchByUnique(req);
      
      req.data.match_id = req.data.match_id || await getNextId(req)
    })


    this.before('UPDATE', 'Matches', async req => {
      console.log("EVENTS: before UPDATE Matchs - update scores");
      await updateScore(req); // make score for all bets
    });

    this.after('READ','LeaderBoards', async req => {
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

const stageMultipliers = {
  "1": 1,
  "2": 2,
  "3": 4,
  "4": 6.5
};

const calculatePoints = (bet, reqData, match) => {
  if (bet.isDraw) {
    return reqData.team1_score == reqData.team2_score ? 3 : 0;
  }
  const team_win_ID = reqData.team1_score > reqData.team2_score ? match.team1_ID : match.team2_ID;

  return bet.team_win_ID == team_win_ID ? stageMultipliers[match.stage] || 1 : 0;
}


module.exports = FMService;