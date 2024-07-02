sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "cap/euro/bettor/soccer/utils/UICommon",
    "cap/euro/bettor/soccer/utils/HttpRequest"
],
    function (BaseController, JSONModel, fioriLibrary, Filter, FilterOperator, UICommon, HttpRequest) {
        "use strict";

        return BaseController.extend("cap.euro.bettor.soccer.controller.MatchList", {
            onInit: function () {
                let oData = {
                    "searchFieldValue": "",
                    "matchStatusKey": "",
                    "matchDayValue": new Date(),
                    "userId": "",
                    "userBets": [],
                    "matchesBets": []
                };

                // set explored app's demo model on this sample
                let oModel = new JSONModel(oData);
                this.setModel(oModel, "viewModel");

                this.getRouter().attachRouteMatched(this.onRouteMatched, this);
            },

            onRouteMatched: async function (oEvent) {
                this.getModel("layoutMod").setProperty("/layout", fioriLibrary.LayoutType.OneColumn);
                let oViewModel = this.getModel("viewModel");
                this._oMatchTable = this.byId("table");

                //Get logged user
                let getUserInfoContextBinding = this.getModel("mainModel").bindContext("/GetUserInfo(...)");
                await getUserInfoContextBinding.invoke();
                let email = getUserInfoContextBinding.getBoundContext().getObject().id;

                const userFilters = new Filter("email", "EQ", email);
                const usersFiltered = await this.filterUsers(userFilters);
                const userId = usersFiltered?.[0]?.user_id;
                if (UICommon.fnIsEmpty(userId)) {
                    this.hideBusy();
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }

                oViewModel.setProperty("/userId", userId);

                let aMatches = await this._fnGetMatchBetResults(userId);
                oViewModel.setProperty("/matchesBets", aMatches);

                if (this._oMatchTable) {
                    this._oMatchTable.getBinding("items").refresh("$auto");
                }
                
                this.onSearch();

            },

            onItemPress: function (oEvent) {

                let oItem = oEvent.getSource();
                let matchId = oItem.getBindingContext("viewModel").getObject("match_id");
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
            },
            _fnGetMatchBetResults: function (userId) {
                let sRequestEndpoint = `${this.getFMSrvPath()}/getMatchBetResults(userID='${userId}')`;
                console.log(`Request getMatchBetResults Endpoint: ${sRequestEndpoint}`);
                const oSettings = {
                    headers: {
                        "Accept-Language": 'en'
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
                        console.log("getMatchBetResults - Error: ", oError);
                        resolve([]);
                        this.hideBusy();
                    }, oSettings);
                });

            }
            //EOF
        });
    });
