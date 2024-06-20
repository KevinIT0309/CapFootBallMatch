const stageMultipliers = {
    "1": 1,
    "2": 2,
    "3": 4,
    "4": 6.5
};

const calculatePoints = (bet, reqData, match) => {
    if (bet.isDraw) {
        return reqData.team1_score == reqData.team2_score ? (stageMultipliers[match.stage] || 1) : 0;
    }
    const team_win_ID = reqData.team1_score > reqData.team2_score ? match.team1_ID : reqData.team1_score < reqData.team2_score ? match.team2_ID : null;
    
    return bet.team_win_ID == team_win_ID ? (stageMultipliers[match.stage] || 1) : 0;
}

module.exports = { calculatePoints };