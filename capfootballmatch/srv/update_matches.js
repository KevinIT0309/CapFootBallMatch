const fetch = require('node-fetch');
const cron = require('node-cron');
const { calculatePoints } = require('./utils.js');

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4/competitions/EC/matches?status=FINISHED&dateFrom={dateFrom}&dateTo={dateTo}';

const fetchMatchResults = async () => {
  const date = new Date();
  const toDate = date.toISOString().slice(0, 10);
  date.setDate(date.getDate() - 1);
  const yesDate = date.toISOString().slice(0, 10);

  const updatedURL = API_URL.replace(/{dateTo}/g, toDate).replace(/{dateFrom}/g, yesDate);

  const response = await fetch(updatedURL, {
    headers: {
      'X-Auth-Token': API_KEY
    }
  });
  const data = await response.json();
  return data && data.matches ? data.matches : [];
};

const updateMatchResults = async () => {

   
  const matchResults = await fetchMatchResults();
  console.log('Updating match result: ' + JSON.stringify());

  for (const result of matchResults) {
    const rqMatchName = (result.homeTeam.name + '-' + result.awayTeam.name)
                          .replace(/'Netherlands'/g, 'Holland');
    const match = await SELECT.one.from('football.match.Matches')
      .where({
        match_name: { like: '%' + rqMatchName + '%' },
        match_time: result.utcDate,
        status: { '!=': 3 }
      });

    if (match) {
      await UPDATE('football.match.Matches').set({
        status: "3",
        team1_score: result.score.fullTime.home,
        team2_score: result.score.fullTime.away,
        team_win_ID: result.score.winner == 'HOME_TEAM' ? match.team1_ID : result.score.winner == 'AWAY_TEAM' ? match.team2_ID : ''
      }).where({ match_id: match.match_id });

      await updateBets({team1_score: result.score.fullTime.home, team2_score: result.score.fullTime.away}, match);
    }
  }
};

cron.schedule('0 * * * *', () => {
  console.log('Updating match result...');
  updateMatchResults().catch(err => {
    console.error('Error updating match results:', err);
  });
});

const updateBets = async (result, match) => {
  const bets = await SELECT.from('football.match.Bets').where({ match_ID: match.match_id });
  await DELETE.from('football.match.Scores').where({ match_ID: match.match_id });
  for (const bet of bets) {
    const now = new Date();
    const score = {
      createdAt: now,
      modifiedAt: now,
      createdBy: "anonymous",
      modifiedBy: "anonymous",
      user_ID: bet.user_ID,
      match_ID: match.match_id,
      points: calculatePoints(bet, result, match)
    };
    console.log("EVENTS: score " + JSON.stringify(score));
    await INSERT.into('football.match.Scores').entries(score);
  }
}

module.exports = { updateMatchResults };