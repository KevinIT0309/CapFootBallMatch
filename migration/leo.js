const xlsx = require('xlsx');
const fs = require('fs');
const moment = require('moment');

const sourceDataPath = 'AISC2.xlsx';

function fnCheckFileExists(filePath) {
    return fs.existsSync(filePath);
}

//Check exist source before process
if (!fnCheckFileExists(sourceDataPath)) {
    console.error('Error: File not found:', sourceDataPath);
    process.exit(1);
}

// Load the Excel file
const workbook = xlsx.readFile(sourceDataPath);

// Select the sheet 'Dự Đoán Kết Quả Vòng Loại'
const sheetName = 'Dự Đoán Kết Quả Vòng Loại';
const sheet = workbook.Sheets[sheetName];

// Convert excel Date to JS Date to store to DB
function fnExcelDateToJSDate(serial) {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);

    const fractionalDay = serial - Math.floor(serial) + 0.0000001;
    let totalSeconds = Math.floor(86400 * fractionalDay);

    const seconds = totalSeconds % 60;
    totalSeconds -= seconds;

    const hours = Math.floor(totalSeconds / (60 * 60));
    const minutes = Math.floor(totalSeconds / 60) % 60;

    return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate(), hours, minutes, seconds);
}

function fnConvertToISO(dateString) {
    let date;
    dateString = String(dateString);
    // Check if the input is already in ISO format and ends with 'Z' indicating it's in UTC
    if (!isNaN(Date.parse(dateString)) && dateString.slice(-1) === 'Z') {
        date = new Date(dateString); // Parse the ISO date string to a Date object
    } else {
        date = new Date(dateString);
    }

    // Adjust the date for the timezone offset to get the UTC time
    let utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    const isoString = utcDate.toISOString();

    return isoString;
}

// Convert giờ to hours to store to DB
function fnConvertTime(time) {
    const hourMapping = {
        '1 giờ': '01:00:00',
        '2 giờ': '02:00:00',
        '20 giờ': '20:00:00',
        '21 giờ': '21:00:00',
        '22 giờ': '22:00:00',
        '23 giờ': '23:00:00'
    };
    return hourMapping[time] || time;
}

function fnGetCellValue(row, column) {
    try {
        return sheet[xlsx.utils.encode_cell({ r: row, c: column })].v;
    } catch (error) {
        console.log(`fnGetCellValue - Error: ${error}`);
        return "";
    }
}

function fnGetDBDateString(sourceDateString) {

    const timeInPlus7 = new Date(`${sourceDateString}+07:00`);

    // Chuyển đổi về UTC
    const dbDate = new Date(timeInPlus7.toISOString());
    return dbDate.toISOString().slice(0, -5) + "Z";
}
// Craete match Object
function fnBuildMatchObject(column) {
    const matchId = parseInt(fnGetCellValue(0, column));
    const teams = fnGetCellValue(1, column).split('-');
    const matchName = fnGetCellValue(2, column);
    const matchDateRaw = fnGetCellValue(3, column);
    const matchTimeRaw = fnGetCellValue(4, column);
    const matchTime = fnConvertTime(matchTimeRaw);


    const jsDate = fnExcelDateToJSDate(matchDateRaw);

    // Format the date to 'YYYY-MM-DD'
    const matchDate = moment(jsDate).format('YYYY-MM-DD');//2024-06-14T19:00:10.000Z

    // Combine date and time
    let matchDateTime = `${matchDate} ${matchTime}`;
    matchDateTime = fnGetDBDateString(matchDateTime);

    let team1Id = parseInt(teams[0]);
    let team2Id = parseInt(teams[1]);
    return {
        matchId: matchId,
        matchName: matchName,
        matchTime: matchDateTime,
        status: 1,
        isOver: false,
        team1Id: team1Id,
        team2Id: team2Id,
        stage: 'group'
    };
}


// build Bet Object for create Bet
function fnBuildMatchBets(column, matchId, team1Id, team2Id, matchTime, betTimeBeforeHours) {
    const playerBets = [];
    let row = 10;
    while (true) {
        const userIdCell = sheet[xlsx.utils.encode_cell({ r: row, c: 0 })];
        const userNameCell = sheet[xlsx.utils.encode_cell({ r: row, c: 2 })];
        if (!userIdCell) {
            if (!userNameCell) break;
            row++;
            continue;
        }

        const userId = userIdCell.v;
        const betCell = sheet[xlsx.utils.encode_cell({ r: row, c: column })];

        if (!betCell) {
            row++;
            continue;
        }

        const betValue = betCell.v;
        let teamWinId = null;
        let isDraw = false;

        if (betValue === 'W') {
            teamWinId = team1Id;
        } else if (betValue === 'L') {
            teamWinId = team2Id;
        } else if (betValue === 'D') {
            isDraw = true;
        }

        let betTime = moment(matchTime).subtract(betTimeBeforeHours, 'hours').format('YYYY-MM-DD HH:mm:ss');
        betTime = fnGetDBDateString(betTime);

        const bet = {
            user_ID: userId,
            match_ID: matchId,
            team_win_ID: teamWinId,
            isDraw: isDraw,
            bet_time: betTime
        };
        playerBets.push(bet);
        row++;
    }
    return playerBets;
}

function fnBuildMigrateData(columnTo) {
    console.log('------------------------------------ START MIGRATION');
    const processData = [];
    const betTimeBeforeHours = 3;//number of 
    //Call Matches Odata fms_srv/Matchs
    const aDBMatchs = [];
    //Call Matches Odata fms_srv/Teams
    const aTeams = [];
    //Start from col 3 Đức vs Scotland
    for (let col = 3; col <= columnTo; col++) {
        const match = fnBuildMatchObject(col);//match từ excel
        // const oMatch =  find match in aDBMatchs //match từ db (dùng cái này)
        const bets = fnBuildMatchBets(col, match.matchId, match.team1Id, match.team2Id, match.matchTime, betTimeBeforeHours);
        match.bets = bets;
        processData.push(match);
    }
    return processData;
}


const toMatchCol = 38;   // Column J for now Serbia vs Anh
const processData = fnBuildMigrateData(toMatchCol);
console.log('------------------------------------ FINISHED COLLECT RAW DATA FOR PROCESS');

// Write the matches to a JSON file
fs.writeFileSync('migratedata.json', JSON.stringify(processData, null, 2));
console.log('Migrate data have been extracted and saved to migratedata.json');
console.log('------------------------------------ START UPSERT DATA TO CLOUD APPS');

const axios = require('axios');

const BASE_URL = 'https://proconarum-sandbox-system-snd-capfootballmatch-srv.cfapps.eu10-004.hana.ondemand.com/odata/v4/ces/FM_SRV';
const TOKEN = '';

// async function getBets() {
//     const response = await axios.get(`${BASE_URL}/Bets`, {
//         headers: {
//           'Authorization': `Bearer ${TOKEN}`,
//           'Content-Type': 'application/json'
//         }
//       });    
//     const userMatchMap = new Map();
//     response.data.value.forEach(bet => {
//       const key = `${bet.user_ID}-${bet.match_ID}`;
//       userMatchMap.set(key, bet);
//     });  
//     console.log(userMatchMap);
//     return userMatchMap;
//  }

// // const betsInHana = await getBets(); 

// async function test() {
//     getBets();
// }

async function processMatchBatch(matchBatch) {
    const userMatchMap = getBets();
    return Promise.all(matchBatch.map(async (match) => {
      try {
        // const response = await axios.get(`${BASE_URL}/Matches`, {
        //   headers: {
        //     'Authorization': `Bearer ${TOKEN}`,
        //     'Content-Type': 'application/json'
        //   },
        //   params: {
        //     $filter: `team1_ID eq ${match.team1_ID} and team2_ID eq ${match.team2_ID}`
        //   }
        // });
  
        // if (response.data.value.length <= 0) {
        //   await axios.post(`${BASE_URL}/Matches`, match, {
        //     headers: {
        //       'Authorization': `Bearer ${TOKEN}`,
        //       'Content-Type': 'application/json'
        //     }
        //   });
        // }
        
        await Promise.all(match.bets.map(async (bet) => {
            await axios.post(`${BASE_URL}/Bets`, bet, {
                headers: {
                  'Authorization': `Bearer ${TOKEN}`,
                  'Content-Type': 'application/json'
                }
             });
        }));

      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
      }
    }));
}
  
async function processAllMatches(data) {
    for (let i = 0; i < data.length; i += 2) {
      const batch = data.slice(i, i + 2);
      await processMatchBatch(batch);
    }
 }
  
// processAllMatches(processData);

//TODO using parallel async & batch processing to quick process & avoid memory leak/ trigger db 
//https://www.w 3schools.com/jsref/jsref_promise_all.asp
//for match in matchs
// for bet in match.bets
//     call odata createBet(bet) 
//way of work with Bet
//Condition of Bet: UserId, MatchId
//Note: Please keep predictsGoal
//OPtion 1. Upsert -> có thì update ko có insert
//Option 2. Deletesert -> có thì delete ko có insert (trước khi delete nhớ lấy lại predictGoals)
//Find bet by (userId,match)
// if bet OK
// let aPredictGoals =bet.predictGoals
// delete bet;

// newBet.predictGoals = aPredictGoals;
// createBet(newBet) 
//NO loop select select all then use fnFindObjectInArray to find item in array