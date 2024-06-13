sap.ui.define([
    "cap/euro/admin/football/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/formatter"
], function (BaseController, MessageToast, MessageBox, formatter) {
    "use strict";

    return BaseController.extend("cap.euro.admin.football.controller.MatchResult", {
        onInit: function () {
            this.getRouter().getRoute("matchResult").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function (oEvent) {
            this._matchId = oEvent.getParameter("arguments").matchId;
            if (this._matchId) {
                this._layout = oEvent.getParameter("arguments").layout;
                this.getModel("mainModel")
                this.getView().bindElement({
                    "path": `/Matches(${this._matchId})`,
                    "model": "mainModel",
                    "parameters": { "expand": "team1,team2" }
                });

                this.getModel("layoutMod").setProperty("/layout", this._layout);
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
        }
    });
});
