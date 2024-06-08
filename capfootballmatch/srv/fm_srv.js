const cds = require('@sap/cds');

class FMService extends cds.ApplicationService {
  init() {
    const { Bets, Matches } = this.entities

    this.before(['CREATE'], Matches, async req => {
      const now = new Date();
      if (new Date(req.data.match_time) <= now) {
        return req.error(400, 'Overdue to create');
      }
    })

    this.before(['UPDATE'], Matches, async req => {
    
      const { match_id } = req.params[0];
      const match = await cds.tx(req).run(SELECT.one.from('football.match.Matches').where({ match_id }));
      if (!match) {
        return req.error(400, 'Match does not exist');
      }

      const now = new Date();
      if (new Date(match.match_time) <= now) {
        return req.error(400, 'Overdue to update');
      }
    })

    this.before(['DELETE'], Matches, async req => {
      
      const { match_id } = req.params[0];
      const match = await cds.tx(req).run(SELECT.one.from('football.match.Matches').where({ match_id }));
      if (!match) {
        return req.error(400, 'Match does not exist');
      }

      const now = new Date();
      if (new Date(match.match_time) <= now) {
        return req.error(400, 'Overdue to delete');
      }
    })

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