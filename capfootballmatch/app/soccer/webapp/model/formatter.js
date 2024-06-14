sap.ui.define([], () => {
    "use strict";

    return {
        formatResultText: function (team1_score, team2_score, status) {
            if (parseInt(status) !== 3) {
                return "N/A";
            }

            if (!isNaN(parseInt(team1_score)) && !isNaN(parseInt(team2_score))) {
                return `${team1_score} : ${team2_score}`;
            } else {
                return "N/A";
            }
        },

        // determineActiveBetStatus: function (match_time, predictGoals) {
        //     let matchDate = new Date(match_time);
        //     let instant = new Date();

        //     if (predictGoals.length > 0) {
        //         predictGoals.forEach(({ team1_numOfGoals, team2_numOfGoals }) => {
        //             if (isNaN(parseInt(team1_numOfGoals))) {
        //                 return false;
        //             }

        //             if (isNaN(parseInt(team2_numOfGoals))) {
        //                 return false;
        //             }
        //         })
        //     }

        //     if (matchDate.getTime() < instant.getTime()) {
        //         return true;
        //     }

        //     return false;
        // }
    };
});