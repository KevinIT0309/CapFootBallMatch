sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "cap/euro/bettor/soccer/model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "cap/euro/bettor/soccer/utils/UICommon",
    "cap/euro/bettor/soccer/constants/AppGlobalConstant",
], function (BaseController, JSONModel, Filter, FilterOperator, formatter, MessageToast, MessageBox, UICommon, AppGlobalConstant) {
    "use strict";

    return BaseController.extend("cap.euro.bettor.soccer.controller.PlayerBetHistory", {
        formatter: formatter,
        onInit: function () {
            this.getRouter().getRoute("playerBetHistory").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: async function (oEvent) {
            try {
                this.showBusy();
                const playerUserId = oEvent.getParameter("arguments").userId;
                const layout = oEvent.getParameter("arguments").layout;
                if (UICommon.fnIsEmpty(playerUserId)) {
                    this.hideBusy();
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }
                if (UICommon.fnIsEmpty(layout)) {
                    this.hideBusy();
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }
                UICommon.devLog(`Route Bet History PlayerId: ${playerUserId}`);
                let oData = {
                    "playerUserId": playerUserId,
                    "playerName":"",
                    "betItems": []
                };

                // set explored app's demo model on this sample
                let oModel = new JSONModel(oData);
                this.setModel(oModel, "local");

                this.getModel("layoutMod").setProperty("/layout", layout);
                
                //Get bet histories
                let betMatchesFilters = this._buildPlayerBetFilter(playerUserId);
                const aPlayerBetItems = await this._getPlayerBets(betMatchesFilters);
                if(aPlayerBetItems && aPlayerBetItems.length > 0){
                    const oPlayerBetItem = aPlayerBetItems[0];//get first item
                    oModel.setProperty("/playerName", oPlayerBetItem.user.fullName);
                }
                oModel.setProperty("/betItems", aPlayerBetItems);
                this.hideBusy();
                
            } catch (error) {
                this.hideBusy();
                console.log(`Route Match Player Bet History - Error:${error}`);
                MessageBox.error(this.getGeneralTechnicalIssueMsg());
                return;

            }
        },
        handleClosePlayerHistory: function (oEvent) {
            this.getRouter().navTo("leaderBoard");
        },
        /**************************************************************************************************************************************************
         * PRIVATE METHOD
         **************************************************************************************************************************************************/
        _filterUsers: async function (filters) {
            const usersBinding = this.getModel("mainModel").bindList("/Users", {
                "$select": "user_ID"
            }).filter(filters);//use new listbinding instance - otherwise not all books will be in the list
            const usersContext = await usersBinding.requestContexts();

            return usersContext.map(userContext => userContext.getObject());
        },

        _buildPlayerBetFilter: function (userId) {
            let filters = [
                new Filter("user_ID", "EQ", userId)
            ]

            return new Filter({
                "filters": filters,
                "and": true
            })
        },

        _getPlayerBets: async function (filters) {
            try {
                //use new listbinding instance
                const playerBetsBinding = this.getModel("mainModel").bindList("/Bets", null, null, filters, {
                    $expand: "user($select=user_id,email,fullName),match($select=match_id,match_name,team_win_ID,match_time,status,team1_score,team2_score)",
                    $orderby: "match/match_time"
                });

                const playerBetContexts = await playerBetsBinding.requestContexts();

                return playerBetContexts.map(playerBetContext => playerBetContext.getObject());
            } catch (error) {
                console.error(`_getPlayerBets - error: ${error.message}`);
                throw error;
            }
        }
        //EOF
    });
});
