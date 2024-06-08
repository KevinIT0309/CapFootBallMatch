sap.ui.define([
    "cap/euro/admin/football/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/f/library"
],
    function (BaseController, JSONModel, fioriLibrary) {
        "use strict";

        return BaseController.extend("cap.euro.admin.football.controller.MatchList", {
            onInit: function () {
                let oData = {
                    "searchFieldValue": "",
                    "matchStatusKey": "",
                    "matchDayValue": null
                };

                // set explored app's demo model on this sample
                let oModel = new JSONModel(oData);
                this.setModel(oModel, "viewModel");

                this.getRouter().attachRouteMatched(this.onRouteMatched, this);
            },

            onRouteMatched: function (oEvent) {
                this.getModel("layoutMod").setProperty("/layout", fioriLibrary.LayoutType.OneColumn);
                this.byId("table").getBinding("items").refresh();
            },

            onItemPress: function (oEvent) {
                let oItem = oEvent.getSource();
                let matchId = oItem.getBindingContext("mainModel").getObject("match_id");
                this.getRouter().navTo("matchResult", { "layout": fioriLibrary.LayoutType.TwoColumnsMidExpanded, "matchId": matchId });
            },

            handleCreateButtonPressed: function () {
                this.getRouter().navTo("createMatch");
            },

            handleDeleteButtonPressed: function (oEvent) {
                let oItem = oEvent.getSource();
                let matchId = oItem.getBindingContext("mainModel").getObject("match_id");
            }
        });
    });
