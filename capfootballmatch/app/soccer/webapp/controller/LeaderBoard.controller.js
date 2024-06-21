sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/f/library",
    "../model/formatter",
    "cap/euro/bettor/soccer/utils/UICommon",
    "cap/euro/bettor/soccer/utils/HttpRequest"
],
    function (BaseController, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, FioriLibrary, formatter, UICommon, HttpRequest) {
        "use strict";

        return BaseController.extend("cap.euro.bettor.soccer.controller.LeaderBoard", {
            formatter: formatter,
            onInit: function () {
                this.oView = this.getView();
                this.oResourceBundle = this.getResourceBundle();
                let oLocalModelData = new JSONModel({
                    searchFieldValue: "",
                    leaderBoards: []
                });
                this.oView.setModel(oLocalModelData, "local");

                this.getRouter("leaderBoard").attachRouteMatched(this._onRouteMatched, this);
            },
            onFilterList: function () {
                const sQuery = this.getView().getModel("local").getProperty("/searchFieldValue");
                const oTable = this.getView().byId("leaderBoard");
                if (!oTable) {
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }
                let aFilters = [];
                if (sQuery && sQuery.length > 0) {
                    aFilters.push(new Filter("userFullName", FilterOperator.Contains, sQuery));
                }

                const oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);
                //For chart
                const oVizFrame = this.getView().byId("idVizFrame");
                if (oVizFrame) {
                    const oVizFrameBinding = oVizFrame.getDataset().getBinding("data");
                    oVizFrameBinding.filter(aFilters);
                }
            },
            onLeaderBoardUpdateFinished: function (oEvent) {
                this.hideBusy();
            },
            onViewPlayerBetHistory: function (oEvent) {
                try {

                    let oItem = oEvent.getSource();
                    let userId = oItem.getBindingContext("mainModel").getObject("userId");
                    if (UICommon.fnIsEmpty(userId)) {
                        this.hideBusy();
                        console.log(`onViewPlayerBetHistory - Can not get Usr`);
                        MessageToast.show("Click too fast. Please try again");
                        return;
                    }
                    this.getRouter().navTo("playerBetHistory", { "layout": FioriLibrary.LayoutType.TwoColumnsMidExpanded, "userId": userId });
                } catch (error) {
                    this.hideBusy();
                    console.log(`onViewPlayerBetHistory - Error:${error}`);
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }
            },
            onAfterRendering: function () {
                var oVizFrame = this.byId("idVizFrame");
                oVizFrame.setVizProperties({
                    title: {
                        text: "Realtime Player Ranking"
                    }
                });
                // Redraw VizFrame
                setTimeout(function () {
                    oVizFrame.invalidate();
                }, 0);
            },
            /**************************************************************************************************************************************************
             * PRIVATE METHOD
             **************************************************************************************************************************************************/
            _onRouteMatched: function (oEvent) {
                try {
                    this.getModel("layoutMod").setProperty("/layout", FioriLibrary.LayoutType.OneColumn);
                    this.byId("leaderBoard").getBinding("items").refresh("$auto");

                } catch (error) {
                    this.hideBusy();
                    console.log(`_onRouteMatched - Error: ${error}`);
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }
            },
            _fnGetLeaderBoards: function () {
                let sRequestEndpoint = `${this.getFMSrvPath()}LeaderBoards`;
                console.log(`Request Leaderboard Endpoint: ${sRequestEndpoint}`);
                const oSettings = {
                    headers: {
                        "Accept-Language": this._sLangId
                    }
                };
                this.showBusy();
                return new Promise((resolve, reject) => {
                    HttpRequest.getData(sRequestEndpoint, (oData) => {
                        this.hideBusy();
                        if (oData.value && oData.value.length > 0) {
                            resolve(oData.value);
                        } else {
                            resolve([]);
                        }
                    }, (oError) => {
                        console.log("Get LeaderBoards - Error: ", oError);
                        resolve([]);
                        this.hideBusy();
                    }, oSettings);
                });

            },
            _buildLeaderBoardList: function (leaderBoads) {
                const aFinalLeaderBoards = [];
                let iRank = 1;
                leaderBoads.forEach((leaderBoardItem) => {
                    leaderBoardItem.rank = iRank;
                    iRank++;
                    leaderBoardItem.badge = formatter.fnGetLeaderBoardBadge(leaderBoardItem.rank);
                    aFinalLeaderBoards.push(leaderBoardItem);
                });
                return aFinalLeaderBoards;
            }
            //EOF
        });
    });
