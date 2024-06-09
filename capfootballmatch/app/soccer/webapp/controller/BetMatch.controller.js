sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, formatter, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("cap.euro.bettor.soccer.controller.BetMatch", {
        onInit: function () {
            this.getRouter().getRoute("betMatch").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: async function (oEvent) {
            this._matchId = oEvent.getParameter("arguments").matchId;
            if (this._matchId) {
                this._matchId = parseInt(this._matchId);

                let oData = {
                    "predictOptions": [],
                    "predictGoals": [{
                        "predict": 1,
                        "team1_numOfGoals": null,
                        "team2_numOfGoals": null
                    },
                    {
                        "predict": 2,
                        "team1_numOfGoals": null,
                        "team2_numOfGoals": null
                    },
                    {
                        "predict": 3,
                        "team1_numOfGoals": null,
                        "team2_numOfGoals": null
                    }],
                    "team_win_ID": "",
                    "isDraw": false,
                    "userId": "",
                    "betMatchID": ""
                };

                // set explored app's demo model on this sample
                let oModel = new JSONModel(oData);
                this.setModel(oModel, "viewModel");

                let matchPath = `/Matches(${this._matchId})`;

                this._layout = oEvent.getParameter("arguments").layout;
                this.getModel("mainModel")
                this.getView().bindElement({
                    "path": matchPath,
                    "model": "mainModel",
                    "parameters": { "expand": "team1,team2" }
                });

                this.getModel("layoutMod").setProperty("/layout", this._layout);

                let matchContextBinding = this.getModel("mainModel").bindContext(matchPath, null, {
                    $expand: {
                        "team1": {
                            $select: ["team_name"]
                        },
                        "team2": {
                            $select: ["team_name"]
                        }
                    }
                });

                let matchContext = await matchContextBinding.requestObject();
                oModel.setProperty("/predictOptions", [
                    {
                        "team_name": matchContext.team1.team_name,
                        "team_id": parseInt(matchContext.team1_ID)
                    },
                    {
                        "team_name": matchContext.team2.team_name,
                        "team_id": parseInt(matchContext.team2_ID)
                    }
                ]);

                let getUserInfoContextBinding = this.getModel("mainModel").bindContext("/GetUserInfo(...)");
                await getUserInfoContextBinding.invoke();
                let email = getUserInfoContextBinding.getBoundContext().getObject().id;

                const userFilters = new Filter("email", "EQ", "email2@gmail.com");
                // const userFilters = new Filter("email", "EQ", email);
                const usersFiltered = await this._filterUsers(userFilters);
                const userId = usersFiltered?.[0]?.user_id;
                oModel.setProperty("/userId", userId);

                if (userId && this._matchId) {
                    let betMatchesFilters = this._buildFilterBetMatch(userId, this._matchId);
                    const betMatchesFiltered = await this._filterBetMatches(betMatchesFilters);

                    if (betMatchesFiltered.length > 0) {
                        let betMatch = betMatchesFiltered[0];
                        oModel.setProperty("/team_win_ID", betMatch.team_win_ID);
                        oModel.setProperty("/isDraw", betMatch.isDraw);
                        oModel.setProperty("/predictGoals", betMatch.predictGoals.map((predictGoal, index) => {
                            return {
                                "predict": index + 1,
                                "team1_numOfGoals": predictGoal.team1_numOfGoals,
                                "team2_numOfGoals": predictGoal.team2_numOfGoals
                            }
                        }));

                        oModel.setProperty("/betMatchID", betMatch.ID);
                    }
                }
            }
        },

        handleTeamWinChange: function (oEvent) {
            let viewModel = this.getModel("viewModel");
            viewModel.setProperty("/team_win_ID", parseInt(oEvent.getSource().getSelectedItem().getAdditionalText()));
        },

        _filterUsers: async function (filters) {
            const usersBinding = this.getModel("mainModel").bindList("/Users", {
                "$select": "user_ID"
            }).filter(filters);//use new listbinding instance - otherwise not all books will be in the list
            const usersContext = await usersBinding.requestContexts();

            return usersContext.map(userContext => userContext.getObject());
        },

        _buildFilterBetMatch: function (user_ID, match_ID) {
            let filters = [
                new Filter("user_ID", "EQ", user_ID),
                new Filter("match_ID", "EQ", match_ID),
            ]

            return new Filter({
                "filters": filters,
                "and": true
            })
        },

        _filterBetMatches: async function (filters) {
            const betMatchesBinding = this.getModel("mainModel").bindList("/Bets").filter(filters);//use new listbinding instance - otherwise not all books will be in the list
            const betMatchesContext = await betMatchesBinding.requestContexts();

            return betMatchesContext.map(betMatchContext => betMatchContext.getObject());
        },

        _validateBetMatch: function () {
            const viewModel = this.getModel("viewModel");
            const userId = viewModel.getProperty("/userId");
            let valid = true;

            if (!userId) {
                MessageBox.error("User not found");
                return false;
            }

            return valid;
        },

        handleSave: async function () {
            const viewModel = this.getModel("viewModel");
            const userId = viewModel.getProperty("/userId");

            if (this._validateBetMatch()) {
                const listBinding = this.getModel("mainModel").bindList("/Bets");
                const predictOptions = viewModel.getProperty("/predictOptions");
                const team1_ID = predictOptions[0].team_id;
                const team2_ID = predictOptions[1].team_id;
                const predictGoals = viewModel.getProperty("/predictGoals");
                const betMatchID = viewModel.getProperty("/betMatchID");
                let predictGoalsPayload = predictGoals.map((predictGoal) => {
                    return {
                        "team1_ID": team1_ID,
                        "team1_numOfGoals": predictGoal.team1_numOfGoals ? parseInt(predictGoal.team1_numOfGoals) : 0,
                        "team2_ID": team2_ID,
                        "team2_numOfGoals": predictGoal.team2_numOfGoals ? parseInt(predictGoal.team2_numOfGoals) : 0,
                    }
                });

                if (betMatchID) {
                    let betMatchPath = `/Bets(${betMatchID})`;
                    await this.getModel("mainModel").delete(betMatchPath, "$single");
                    // let betMatchContextBinding = this.getModel("mainModel").bindContext(betMatchPath);
                    // const boundContext = await betMatchContextBinding.getBoundContext();
                    // boundContext.setProperty("team_win_ID", parseInt(viewModel.getProperty("/team_win_ID")));
                    // boundContext.setProperty("isDraw", viewModel.getProperty("/isDraw"));
                    // boundContext.setProperty("predictGoals", predictGoalsPayload);

                }

                let context = listBinding.create({
                    "user_ID": userId,
                    "bet_time": new Date().toISOString(),
                    "match_ID": this._matchId,
                    "team_win_ID": parseInt(viewModel.getProperty("/team_win_ID")),
                    "isDraw": viewModel.getProperty("/isDraw"),
                    "predictGoals": predictGoalsPayload
                });

                let oView = this.getView();

                // lock UI until submitBatch is resolved, to prevent errors caused by updates while submitBatch is pending
                oView.setBusy(true);

                let fnSuccess = function () {
                    oView.setBusy(false);
                    MessageToast.show("Bet Saved Successfully");
                }.bind(this);

                let fnError = function (oError) {
                    oView.setBusy(false);
                    MessageBox.error(oError.message);
                }.bind(this);

                this.getModel("mainModel").submitBatch("UpdateGroup").then(fnSuccess, fnError);
                this.getRouter().navTo("matchList");
            }
        },

        handleClose: function (oEvent) {
            this.getModel("mainModel").resetChanges("UpdateGroup");
            this.getRouter().navTo("matchList");
        }
    });
});
