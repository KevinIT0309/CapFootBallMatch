sap.ui.define([
    "cap/euro/admin/football/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library"
], function (BaseController, MessageToast, MessageBox, formatter, JSONModel, coreLibrary) {
    "use strict";

    let ValueState = coreLibrary.ValueState;

    return BaseController.extend("cap.euro.admin.football.controller.MatchResult", {
        onInit: function () {
            this.getRouter().getRoute("matchResult").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: async function (oEvent) {
            let oData = {
                "enabledSaveBtn": true,
                "enabledOtherInputs": true,
                "enabledPredictInput": true,
                "enabledMatchStatus": true,
                "predictOptions": [],
                "matchStatusList": [{
                    "matchStatus": 1,
                    "matchStatusDesc": "Waiting"
                }, {
                    "matchStatus": 2,
                    "matchStatusDesc": "Ongoing"
                }, {
                    "matchStatus": 3,
                    "matchStatusDesc": "Done"
                }]
            };

            // set explored app's demo model on this sample
            let oModel = new JSONModel(oData);
            this.setModel(oModel, "viewModel");

            this._matchId = oEvent.getParameter("arguments").matchId;
            if (this._matchId) {
                this._layout = oEvent.getParameter("arguments").layout;
                this.getModel("layoutMod").setProperty("/layout", this._layout);

                let matchPath = `/Matches(${this._matchId})`;
                this.getView().bindElement({
                    "path": matchPath,
                    "model": "mainModel",
                    "parameters": { "expand": "team1,team2" }
                });

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
                const matchTime = matchContext.match_time;

                const matchDateTime = new Date(matchTime);
                const instant = new Date();
                const matchDate = new Date(matchDateTime.toDateString());
                const today = new Date(instant.toDateString());
                // if (matchDate < today) {
                //     oModel.setProperty("/enabledSaveBtn", false);
                //     oModel.setProperty("/enabledPredictInput", false);
                //     oModel.setProperty("/enabledMatchStatus", false);
                // } else {
                    this._validateEnabledProperty();
                // }
            }
        },

        handleTeamWinChange: function (oEvent) {
            let oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (!sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
                oValidatedComboBox.setValueStateText("Please enter a valid country!");
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
            }
        },

        handleSave: function () {
            const bindingPath = this.getView().getBindingContext("mainModel").getPath();
            const object = this.getView().getBindingContext("mainModel").getObject();
            // if (object.status === "3" || object.status === 3 && !object.isOver) { // Done
            //     this.getView().getBindingContext("mainModel").setProperty(`${bindingPath}/isOver`, true, "UpdateGroup");
            // }
            let fnSuccess = function () {
                MessageToast.show("Match Saved Successfully");
                this.getRouter().navTo("matchList");
            }.bind(this);

            let fnError = function (oError) {
                MessageBox.error(oError.message);
            }.bind(this);

            this.getModel("mainModel").submitBatch("UpdateGroup").then(fnSuccess, fnError);
        },

        handleClose: function (oEvent) {
            this.getModel("mainModel").resetChanges("UpdateGroup");
            this.getRouter().navTo("matchList");
        },

        handleScoreChange: function (oEvent) {
            this._validateEnabledProperty();
        },

        handleNumberofPredictsChange: function () {
            this._validateEnabledProperty();
        },

        handleMatchStatusChange: function () {
            this._validateEnabledProperty();
        },
        handleIsOverChange:  function () {
            const object = this.getView().getBindingContext("mainModel").getObject();
        },
        _validateEnabledProperty: function () {
            let viewModel = this.getModel("viewModel");
            const object = this.getView().getBindingContext("mainModel").getObject();
            const status = object.status;
            const isOver = object.isOver;
            if (isOver) {
                viewModel.setProperty("/enabledSaveBtn", false);
                viewModel.setProperty("/enabledOtherInputs", false);
                viewModel.setProperty("/enabledPredictInput", false);
                viewModel.setProperty("/enabledMatchStatus", false);
            } else {
                if (status === "1" || status === 1) { // Awaiting
                    viewModel.setProperty("/enabledPredictInput", true);
                    viewModel.setProperty("/enabledOtherInputs", false);
                } else if (status === "2" || status === 2) { // Ongoing
                    viewModel.setProperty("/enabledPredictInput", false);
                    viewModel.setProperty("/enabledOtherInputs", true);
                } else { // Done
                    const team1_score = object.team1_score;
                    const team2_score = object.team2_score;
                    const predicts = object.predicts;
                    let enabledSaveBtn = (!isNaN(parseInt(team1_score)) && team1_score >= 0) && (!isNaN(parseInt(team2_score)) && team2_score >= 0) && (!isNaN(parseInt(predicts)) && predicts >= 0) ? true : false;
                    viewModel.setProperty("/enabledSaveBtn", enabledSaveBtn);
                }
            }
        }
    });
});
