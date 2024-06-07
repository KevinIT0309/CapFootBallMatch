const cds = require('@sap/cds');

class FMService extends cds.ApplicationService {
  init() {
    const { Bets } = this.entities

    this.before(['CREATE'], Bets, async req => {
      // only allow to create when the match in this bet not yet take place
      const { match_ID } = req.data;
      const match = await cds.tx(req).run(SELECT.one.from('football.match.Matches').where({ match_id: match_ID }));
      if (!match) {
        return req.error(400, 'Match does not exist');
      }
      const now = new Date();
      if (new Date(match.match_time) <= now) {
        return req.error(400, 'Match has already taken place');
      }
    });

    this.on('TotalBetPointsReceived', async req => {
      const { userID } = req.data;
      const result = await cds.tx(req).run(
        SELECT.one`SUM(points) as totalScores`
          .from('football.match.Scores')
          .where({ user_ID: userID })
      );

      return result;
    })
    return super.init()
  }

}
module.exports = FMService;