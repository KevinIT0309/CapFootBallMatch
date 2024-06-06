sap.ui.define([
    "cap/euro/admin/football/controller/BaseController",
    "sap/f/library"
], function (BaseController, fioriLibrary) {
    "use strict";

    return BaseController.extend("cap.euro.admin.football.controller.CreateMatch", {
        onInit: function () {
            this.getRouter().attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function (oEvent) {
            this._layout = oEvent.getParameter("arguments").layout || fioriLibrary.LayoutType.TwoColumnsMidExpanded;
            if (this._layout) {
                // this.getView().bindElement({
                //     "path": "/Matches(" + this._matchId + ")",
                //     "model": "mainModel",
                //     "parameters": { "expand": "team1,team2" }
                // });
            }

            this.getModel("layoutMod").setProperty("/layout", this._layout);
        },

        handleSave: function () {
            this.getModel("mainModel").submitBatch();
            this.getRouter().navTo("matchList");
        },

        handleClose: function (oEvent) {
            this.getModel("mainModel").resetChanges();
            this.getRouter().navTo("matchList");
        }
    });
});
