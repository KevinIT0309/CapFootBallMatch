sap.ui.define([
    "cap/euro/admin/football/controller/BaseController",
    "sap/f/library",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, fioriLibrary, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("cap.euro.admin.football.controller.CreateMatch", {
        onInit: function () {
            this.getRouter().getRoute("createMatch").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            this._layout = oEvent.getParameter("arguments").layout || fioriLibrary.LayoutType.TwoColumnsMidExpanded;
            this.getModel("layoutMod").setProperty("/layout", this._layout);

            let oData = {
                "team1_ID": "",
                "team1_name": "",
                "team2_ID": "",
                "team2_name": "",
                "match_time": new Date(),
                "stage": "",
                "stageList": [{
                    "stage": "1"
                }, {
                    "stage": "2"
                }, {
                    "stage": "3"
                }, {
                    "stage": "4"
                }]
            };

            // set explored app's demo model on this sample
            let oModel = new JSONModel(oData);
            this.setModel(oModel, "viewModel");
        },

        handleMatchTimeChange: function (oEvent) {
            let viewModel = this.getModel("viewModel");
            viewModel.setProperty("/match_time", oEvent.getSource().getDateValue());
        },

        handleTeamChange: function (oEvent) {
            let viewModel = this.getModel("viewModel");
            let id = oEvent.getSource().getId();
            if (id.indexOf("selectTeam1") >= 0) {
                viewModel.setProperty("/team1_name", oEvent.getSource().getSelectedItem().getText());
            } else {
                viewModel.setProperty("/team2_name", oEvent.getSource().getSelectedItem().getText());
            }
        },

        handleSave: function () {
            // Bind context
            const listBinding = this.getModel("mainModel").bindList("/Matches");
            const viewModel = this.getModel("viewModel");
            let context = listBinding.create({
                "team1_ID": parseInt(viewModel.getProperty("/team1_ID")),
                "team2_ID": parseInt(viewModel.getProperty("/team2_ID")),
                "match_name": viewModel.getProperty("/team1_name") + "_" + viewModel.getProperty("/team2_name"),
                "status": 1,
                "stage": viewModel.getProperty("/stage"),
                "match_time": viewModel.getProperty("/match_time")
            });

            let fnSuccess = function () {
                MessageToast.show("Match Saved Successfully");
            }.bind(this);

            let fnError = function (oError) {
                MessageBox.error(oError.message);
            }.bind(this);

            this.getView().setBindingContext(context, "mainModel");
            this.getModel("mainModel").submitBatch("UpdateGroup").then(fnSuccess, fnError);
            this.getRouter().navTo("matchList");
        },

        handleClose: function (oEvent) {
            this.getRouter().navTo("matchList");
        }
    });
});
