sap.ui.define([
    "cap/euro/admin/football/controller/BaseController",
    "sap/f/library",
    "sap/ui/model/json/JSONModel"
], function (BaseController, fioriLibrary, JSONModel) {
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
                "match_time": new Date()
            };

            // set explored app's demo model on this sample
            let oModel = new JSONModel(oData);
            this.setModel(oModel, "viewModel");
        },

        handleTeamChange: function (oEvent) {
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
            // Bind context
            const listBinding = this.getModel("mainModel").bindList("/Matches");
            const viewModel = this.getModel("viewModel");
            let context = listBinding.create({
                "team1_ID": viewModel.getProperty("/team1_ID"),
                "team2_ID": viewModel.getProperty("/team2_ID"),
                "match_name": viewModel.getProperty("/team1_name") + "_" + viewModel.getProperty("/team2_name"),
                "status": 1,
                "match_time": viewModel.getProperty("/match_time")
            });

            this.getView().setBindingContext(context, "mainModel");
            this.getModel("mainModel").submitBatch("UpdateGroup");
            this.getRouter().navTo("matchList");
        },

        handleClose: function (oEvent) {
            this.getRouter().navTo("matchList");
        }
    });
});
