sap.ui.define([], () => {
    "use strict";

    return {
        formatResultText: function (team1_score, team2_score) {
            if (!isNaN(parseInt(team1_score)) && !isNaN(parseInt(team2_score))) {
                return `${team1_score} : ${team2_score}`;
            } else {
                return "N/A";
            }
        }
    };
});