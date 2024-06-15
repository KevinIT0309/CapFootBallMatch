sap.ui.define([
    "cap/euro/admin/football/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/formatter",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, MessageBox, formatter, JSONModel) {
    "use strict";

    return BaseController.extend("cap.euro.admin.football.controller.MatchResult", {
        onInit: function () {
            this.getRouter().getRoute("matchResult").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: async function (oEvent) {
            let oData = {
                "enabledSaveBtn": true,
                "predictOptions": []
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
                if (matchDate <= today) {
                    oModel.setProperty("/enabledSaveBtn", false);
                } else {
                    this._validateEnabledSaveBtn();
                }
            }
        },

        handleSave: function () {
            let fnSuccess = function () {
                MessageToast.show("Match Saved Successfully");
            }.bind(this);

            let fnError = function (oError) {
                MessageBox.error(oError.message);
            }.bind(this);

            this.getModel("mainModel").submitBatch("UpdateGroup").then(fnSuccess, fnError);
            this.getRouter().navTo("matchList");
        },

        handleClose: function (oEvent) {
            this.getModel("mainModel").resetChanges("UpdateGroup");
            this.getRouter().navTo("matchList");
        },

        handleScoreChange: function (oEvent) {
            this._validateEnabledSaveBtn();
        },

        handleNumberofPredictsChange: function () {
            this._validateEnabledSaveBtn();
        },

        _validateEnabledSaveBtn: function () {
            const object = this.getView().getBindingContext("mainModel").getObject();
            const isOver = object.isOver;
            if (isOver) {
                this.getModel("viewModel").setProperty("/enabledSaveBtn", false);
            } else {
                const team1_score = object.team1_score;
                const team2_score = object.team2_score;
                const predicts = object.predicts;
                let enabledSaveBtn =  (!isNaN(parseInt(team1_score)) && team1_score >= 0) || (!isNaN(parseInt(team2_score)) && team2_score >= 0) || (!isNaN(parseInt(predicts)) && predicts >= 0) ? true : false;
                this.getModel("viewModel").setProperty("/enabledSaveBtn", enabledSaveBtn);
            }
        }
    });
});
