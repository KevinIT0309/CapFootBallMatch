sap.ui.define([
    "cap/euro/bettor/soccer/constants/AppGlobalConstant",
    "cap/euro/bettor/soccer/utils/UICommon"
], (AppGlobalConstant, UICommon) => {
    "use strict";

    return {
        getMatchStatusState: function (status) {
            switch (status) {
                case "1":
                    return "Information";
                case "2":
                    return "Success";
                case "3":
                    return "Error";
                default:
                    return status;
            }
        },

        getMatchStatusText: function (status) {
            switch (status) {
                case "1":
                    return "Waiting";
                case "2":
                    return "Ongoing";
                case "3":
                    return "Done";
                default:
                    return status;
            }
        },

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

        //return false;
        // },
        fnGetLeaderBoardBadge: function (rank) {
            const badgePath = `https://cdn.tinhtd.info/aisc/`;
            const oRankBadge = {
                "1": `${badgePath}/1st.png`,
                "2": `${badgePath}/2nd.png`,
                "3": `${badgePath}/3rd.png`,
            };
            if (oRankBadge[rank]) {
                return oRankBadge[rank];
            }

            return `${badgePath}/default-badge.jpg`;

        },
        fnGetLeaderBoardFont: function (rank) {


        },
        fnGetLeaderBoardRankState: function (rank) {
            try {
                const oRankBadge = {
                    "1": 1,
                    "2": 4,
                    "3": 6,
                };
                if (oRankBadge[rank]) {
                    return oRankBadge[rank];
                }

                return 7;
            } catch (error) {
                console.log(`fnGetLeaderBoardState -  Error: ${error}`);
                return 1;
            }

        },
        fnGetLeaderBoardObjectState: function (rank) {
            try {
                const oRankBadge = {
                    "1": "Warning",
                    "2": "Error",
                    "3": "Success",
                };
                if (oRankBadge[rank]) {
                    return oRankBadge[rank];
                }

                return "None";
            } catch (error) {
                console.log(`fnGetLeaderBoardObjectState -  Error: ${error}`);
                return "None";
            }

        },
        fnGetMatchStatusText: function (status) {
            try {
                const { MATCH_STATUS_CONF } = AppGlobalConstant;
                if (MATCH_STATUS_CONF[status]) {
                    return MATCH_STATUS_CONF[status].text;
                }
                return status;
            } catch (error) {
                console.log(`fnGetMatchStatusText - Error: ${error}`);
                return status;
            }

        },
        fnGetMatchStatusState: function (status) {
            try {
                const { MATCH_STATUS_CONF } = AppGlobalConstant;
                if (MATCH_STATUS_CONF[status]) {
                    return MATCH_STATUS_CONF[status].state;
                }
                return status;
            } catch (error) {
                console.log(`fnGetMatchStatusState - Error: ${error}`);
                return status;
            }

        },
        fnStringToNumber: function () {

        },
        fnHandleEnabledBetButton: function (bUiEnabled, status) {
            try {
                UICommon.devLog(`fnHandleEnabledBetButton - UiEnabled: ${bUiEnabled} - Status: ${status}`);
                if (!status) {
                    console.warn('status is undefined or null');
                }
                const { MATCH_STATUS } = AppGlobalConstant;
                return !!bUiEnabled && status == MATCH_STATUS.WAITING;
            } catch (error) {
                console.error('Error in fnHandleEnabledBetButton:', error);
                return false;
            }

        },
        fnVisibleLeaderBoardAvatar: function (winning) {
            try {
                UICommon.devLog(`fnVisibleLeaderBoardAvatar - winning: ${winning}`);
                return winning != 0;
            } catch (error) {
                console.log(`fnVisibleLeaderBoardAvatar -  Error: ${error}`);
                return false;
            }
        },
        fnGetRowIndex: function () {

        },
        fnGetBetStatusText: function (betDraw,betTeamWin,matchStatus, matchTeamWin,team1Score,team2Score) {
            if(matchStatus != 3){
                return "Waiting Result";
            }
            if (betDraw) {
                if(team1Score == team2Score){
                    return "Win";
                }
                return "Lose";
            }
            if (betTeamWin == matchTeamWin) {
                return "Win";
            }
            return "Lose";
        },
        fnGetBetStatusState: function (betDraw,betTeamWin,matchStatus, matchTeamWin,team1Score,team2Score) {
            if(matchStatus != 3){
                return 6;
            }
            if (betDraw) {
                if(team1Score == team2Score){
                    return 1;
                }
                return 3;
            }
            if (betTeamWin == matchTeamWin) {
                return 1;
            }
            return 3;
        },
        fnGetLoggedUserBetResultText: function (betTeamWin, matchTeamWin) {
            UICommon.devLog(`fnGetLoggedUserBetResultText BetTeamWin:${betTeamWin} - MatchTeamWin: ${matchTeamWin}`);
            if (UICommon.fnIsEmpty(matchTeamWin)) {
                return "N/A";
            }
            if (betTeamWin == matchTeamWin) {
                return "YOU WIN";
            }
            return "YOU LOSS";
        },
        fnGetLoggedUserBetResultState: function (betTeamWin, matchTeamWin) {
            UICommon.devLog(`BetTeamWin:${betTeamWin} - MatchTeamWin: ${matchTeamWin}`);
            if (UICommon.fnIsEmpty(matchTeamWin)) {
                return "None";
            }
            if (betTeamWin == matchTeamWin) {
                return "Success";
            }
            return "Error";
        },
        fnGetBetPointByMatchStage:function(stage){
            try {
                const { MATCH_STAGE_MULTIPLIER } = AppGlobalConstant;
                if(MATCH_STAGE_MULTIPLIER[stage]){
                    return MATCH_STAGE_MULTIPLIER[stage];
                }
                return 0;
            } catch (error) {
                console.error('Error in fnGetBetPointByMatchStage:', error);
                return 0;
            }
        }
        //EOF
    };
});