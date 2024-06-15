sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
    "cap/euro/bettor/soccer/utils/UICommon",
    "cap/euro/bettor/soccer/utils/HttpRequest"
],
    function (BaseController, JSONModel, MessageBox, Filter, FilterOperator, formatter, UICommon, HttpRequest) {
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
                    aFilters.push(new Filter("playerName", FilterOperator.Contains, sQuery));
                }

                const oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);
            },
            /**************************************************************************************************************************************************
             * PRIVATE METHOD
             **************************************************************************************************************************************************/
            _onRouteMatched: function (oEvent) {
                try {
                    this.showBusy();
                    let oLocalModal = this.oView.getModel("local");
                    const oRequestLeaderBoardList = this._fnGetLeaderBoards();
                    $.when(oRequestLeaderBoardList).done((aOriginalLeaderBoards) => {
                        this.hideBusy();
                        const aLeaderBoards = this._buildLeaderBoardList(aOriginalLeaderBoards);
                        oLocalModal.setProperty("/leaderBoards", aLeaderBoards);
                        oLocalModal.refresh();
                    });
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
                leaderBoads.forEach((leaderBoardItem) => {
                    leaderBoardItem.badge = formatter.fnGetLeaderBoardBadge(leaderBoardItem.rank);
                    aFinalLeaderBoards.push(leaderBoardItem);
                });
                return aFinalLeaderBoards;
            }
            //EOF
        });
    });
