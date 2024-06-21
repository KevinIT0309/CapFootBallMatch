const path = require('path');
const fs = require('fs');
const filePath = path.join('/home/user/projects/CapFootBallMatch/migration/migratedata.json');
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

function read() {
    
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8')) ;
        // console.log(JSON.stringify(inputData));
    } else {
        console.error(`File '${filePath}' not found.`);
    }
}

const records = [];

read().map(
  match => {
    match.bets.map(async bet => {
      if (bet.user_ID != 'end') {
        records.push({
          ID: uuidv4(),
          CREATEDAT: '2023-06-30T00:00:00Z',
          CREATEDBY: 'system',
          MODIFIEDAT:'2023-06-30T00:00:00Z',
          MODIFIEDBY: 'system',
          BET_TIME: '2023-06-30T00:00:00Z',
          USER_ID: bet.user_ID,
          MATCH_ID: bet.match_ID,
          TEAM_WIN_ID: bet.team_win_ID,
          ISDRAW: bet.isDraw,
          PREDICTGOALS: JSON.stringify([])
        });
      }
    })
  }
);

  
csvWriter.writeRecords(records)
    .then(() => {
      console.log('...Done');
    })
    .catch(err => {
      console.error('Error writing CSV:', err);
});

// async function insertData(data) {
//   const tx = cds.transaction();
  
//   try {
//     await Promise.all(data.map(async match => {
//       await Promise.all(match.bets.map(async bet => {
//         const { userId, matchId } = bet;
//         const existingBet = await tx.run(
//           SELECT.from(Bets).where({ user_ID: userId, match_ID: matchId })
//         );
        
//         if (existingBet.length > 0) {
//           await tx.run(
//             UPDATE(Bets).set(bet).where({ user_ID: userId, match_ID: matchId })
//           );
//           console.log(`Updated bet for User ${userId} on Match ${matchId}.`);
//         } else {
//           await tx.run(
//             INSERT.into(Bets).entries(bet)
//           );
//           console.log(`Inserted new bet for User ${userId} on Match ${matchId}.`);
//         }
//       }));
//     }));
    
//     await tx.commit();
//     console.log('Data inserted/updated successfully.');
//   } catch (error) {
//     console.error('Error inserting/updating data:', error);
//     await tx.rollback();
//   }
// }
module.exports = {
    read: read
}