sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
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
                    "isDraw": null
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
            let id = oEvent.getSource().getId();
            if (id.indexOf("selectTeam1") >= 0) {
                viewModel.setProperty("/team1_name", oEvent.getSource().getSelectedItem().getText());
                viewModel.setProperty("/team1_ID", parseInt(oEvent.getSource().getSelectedItem().getAdditionalText()));
            } else {
                viewModel.setProperty("/team2_name", oEvent.getSource().getSelectedItem().getText());
                viewModel.setProperty("/team2_ID", parseInt(oEvent.getSource().getSelectedItem().getAdditionalText()));
            }
        },

        handleSave: function () {
            this.getModel("mainModel").submitBatch("UpdateGroup");
            this.getRouter().navTo("matchList");
        },

        handleClose: function (oEvent) {
            this.getModel("mainModel").resetChanges("UpdateGroup");
            this.getRouter().navTo("matchList");
        }
    });
});
