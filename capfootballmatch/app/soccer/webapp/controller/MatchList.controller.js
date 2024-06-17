sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (BaseController, JSONModel, fioriLibrary, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("cap.euro.bettor.soccer.controller.MatchList", {
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
                this.byId("table").getBinding("items").refresh("$auto");
            },

            onItemPress: function (oEvent) {
                this.showBusy();
                let oItem = oEvent.getSource();
                let matchId = oItem.getBindingContext("mainModel").getObject("match_id");
                this.getRouter().navTo("betMatch", { "layout": fioriLibrary.LayoutType.TwoColumnsMidExpanded, "matchId": matchId });
            },

            handleMatchDayValueChange: function (oEvent) {
                let bValid = oEvent.getParameter("valid");

                if (!bValid) {
                    sap.m.MessageToast.show("Entered date range isn't valid");
                    return;
                }
            },

            onSearch: function () {
                let viewModel = this.getModel("viewModel");
                // let matchStatusKey = viewModel.getProperty("/matchStatusKey");
                let matchDayValue = viewModel.getProperty("/matchDayValue");
                let filters = [];

                // if (matchStatusKey) {
                //     filters.push(new Filter("status", "EQ", parseInt(matchStatusKey)));
                // }

                if (matchDayValue) {
                    let upperMatchDatetime = new Date(new Date(matchDayValue.getTime()).setHours(0, 0, 0));
                    let lowerMatchDatetime = new Date(new Date(matchDayValue.getTime()).setHours(23, 59, 59));
                    filters.push(new Filter("match_time", "BT", upperMatchDatetime.toISOString(), lowerMatchDatetime.toISOString()));
                }

                if (filters.length) {
                    this.byId("table").getBinding("items").filter(
                        new Filter({
                            "filters": filters,
                            "and": true
                        })
                    );
                } else {
                    this.byId("table").getBinding("items").filter([]);
                }
            }
        });
    });
