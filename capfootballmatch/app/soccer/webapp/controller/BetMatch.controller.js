sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageBox) {
    "use strict";

    return BaseController.extend("cap.euro.bettor.soccer.controller.BetMatch", {
        onInit: function () {
            this.getRouter().getRoute("betMatch").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            this._matchId = oEvent.getParameter("arguments").matchId;
            if (this._matchId) {
                let oData = {
                    "predictOptions": [],
                    "team_win_ID": "",
                    "isDraw": false
                };

                // set explored app's demo model on this sample
                let oModel = new JSONModel(oData);
                this.setModel(oModel, "viewModel");

                let path = "/Matches(" + this._matchId + ")";

                this._layout = oEvent.getParameter("arguments").layout;
                this.getModel("mainModel")
                this.getView().bindElement({
                    "path": path,
                    "model": "mainModel",
                    "parameters": { "expand": "team1,team2" }
                });

                this.getModel("layoutMod").setProperty("/layout", this._layout);

                let contextBinding = this.getModel("mainModel").bindContext(path, null, {
                    $expand: {
                        "team1": {
                            $select: ["team_name"]
                        },
                        "team2": {
                            $select: ["team_name"]
                        }
                    }
                });

                contextBinding.requestObject().then(function (data) {
                    oModel.setProperty("/predictOptions", [
                        {
                            "team_name": data.team1.team_name,
                            "team_id": data.team1_ID
                        },
                        {
                            "team_name": data.team2.team_name,
                            "team_id": data.team2_ID
                        }
                    ]);
                }.bind(this));
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

        handleSave: async function () {
            // this.getModel("mainModel").submitBatch("UpdateGroup");
            // Get user id based on email id
            const userFilters = new Filter("email", "EQ", "email-123");
            const usersFiltered = await this._filterUsers(userFilters);
            const userId = usersFiltered?.[0]?.user_id;

            if (userId) {
                debugger;
                // const listBinding = this.getModel("mainModel").bindList("/Bets");
                // const viewModel = this.getModel("viewModel");
                // let context = listBinding.create({
                //     "user_ID": parseInt(viewModel.getProperty("/userId")),
                //     "match_ID": this._matchId,
                //     "team_win_ID": parseInt(viewModel.getProperty("/team_win_ID")),
                //     "isDraw": viewModel.getProperty("/isDraw"),
                //     "predictGoals": viewModel.getProperty("/match_time")
                // });

                // this.getView().setBindingContext(context, "mainModel");
                // this.getModel("mainModel").submitBatch("UpdateGroup");


                // this.getRouter().navTo("matchList");
            } else {
                MessageBox.error("User not found");
            }
        },

        handleClose: function (oEvent) {
            this.getModel("mainModel").resetChanges("UpdateGroup");
            this.getRouter().navTo("matchList");
        }
    });
});
