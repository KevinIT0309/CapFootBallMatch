const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const { v4: uuidv4 } = require('uuid');

const csvWriter = createObjectCsvWriter({
    path: 'bets.csv',
    header: [
      { id: 'ID', title: 'ID' },
      { id: 'bet_time', title: 'bet_time' },
      { id: 'user_ID', title: 'user_ID' },
      { id: 'match_ID', title: 'match_ID' },
      { id: 'team_win_ID', title: 'team_win_ID' },
      { id: 'isDraw', title: 'isDraw' },
      { id: 'predictGoals', title: 'predictGoals' }
    ]
  });
  
const currentTime = new Date().toISOString();

const filePath = path.join('./migratedata.json');

function read() {
    if (fs.existsSync(filePath)) {
        retrun fs.readFileSync(filePath, 'utf8');
        // console.log(JSON.stringify(inputData));
    } else {
        console.error(`File '${filePath}' not found.`);
    }
}
read();

// const records = read().map(bet => ({
//     ID: uuidv4(),
//     bet_time: currentTime,
//     user_ID: bet.user_ID,
//     match_ID: bet.match_ID,
//     team_win_ID: bet.team_win_ID,
//     isDraw: bet.isDraw,
//     predictGoals: JSON.stringify([])
// }));
  
// csvWriter.writeRecords(records)
//     .then(() => {
//       console.log('...Done');
//     })
//     .catch(err => {
//       console.error('Error writing CSV:', err);
// });