sap.ui.define([
    "cap/euro/admin/football/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    function (BaseController, JSONModel, fioriLibrary, Filter, FilterOperator, MessageToast, MessageBox) {
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
                let selectedItem = this.byId("table").getSelectedItem();
                let context = selectedItem.getBindingContext("mainModel");

                context.delete().then(function () {
                    MessageToast.show("Delete match successfully");
                }.bind(this), function (oError) {
                    MessageBox.error(oError.message);
                }.bind(this));

                this.getModel("mainModel").submitBatch("UpdateGroup");
            },

            onSearch: function () {
                let viewModel = this.getModel("viewModel");
                let matchStatusKey = viewModel.getProperty("/matchStatusKey");
                let matchDayValue = viewModel.getProperty("/matchDayValue");
                let filters = [];

                if (matchStatusKey) {
                    filters.push(new Filter("status", "EQ", parseInt(matchStatusKey)));
                }

                if (matchDayValue) {
                    filters.push(new Filter("match_time", "EQ", matchDayValue.toISOString()));
                }

                if (filters.length) {
                    this.byId("table").getBinding("items").filter(
                        new Filter({
                            "filters": filters,
                            "and": true
                        })
                    );
                }
            }
        });
    });
