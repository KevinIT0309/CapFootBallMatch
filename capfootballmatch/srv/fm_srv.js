const cds = require('@sap/cds');

class FMService extends cds.ApplicationService {
  init() {
    const { Bets, Matchs, Scores } = this.entities

    //Bets events
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

    // Matches events
    this.before('UPDATE', 'Matches', async req => {
      console.log("EVENTS: before UPDATE Matchs - update scores");
      await updateScore(req); // make score for all bets
    });

    return super.init();
  }
}

const hasMatchTaken = async (req, match_ID) => {
  const match = await cds.tx(req).run(SELECT.one.from('football.match.Matches').where({ match_id: match_ID }));
  if (!match) {
    return req.error(400, 'Match does not exist');
  }
  const now = new Date();
  return new Date(match.match_time) <= now;
}

const updateScore = async (reqData) => {
  try {
    const { match_id } = reqData.params[0];
    const bets = await cds.tx(reqData).run(SELECT.from('football.match.Bets').where({ match_ID: match_id }));

    for (const bet of bets) {
      const now = new Date();
      const score = {
        createdAt: now,
        modifiedAt: now,
        createdBy: "anonymous",
        modifiedBy: "anonymous",
        user_ID: bet.user_ID,
        match_ID: match_id,
        points: calculatePoints(bet, reqData.data)
      };
      console.log("EVENTS: score " + JSON.stringify(score));
      await cds.tx(reqData).run(INSERT.into('football.match.Scores').entries(score));
    }
  } catch (error) {
    console.error('Error when update scores' + error);
  }
}

const calculatePoints = (bet, reqData) => {
  if (bet.isDraw) {
    return reqData.team1_score == reqData.team2_score ? 3 : 0;
  }
  const team_win_ID = reqData.team1_score > reqData.team2_score ? reqData.team1_ID : reqData.team2_ID;

  return bet.team_win_ID == team_win_ID ? 3 : 0;
}

module.exports = FMService;