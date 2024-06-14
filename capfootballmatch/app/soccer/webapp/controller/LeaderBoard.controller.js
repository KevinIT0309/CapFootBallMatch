sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "cap/euro/bettor/soccer/utils/UICommon"
],
    function (BaseController, JSONModel, MessageBox, Filter, FilterOperator, UICommon) {
        "use strict";

        return BaseController.extend("cap.euro.bettor.soccer.controller.LeaderBoard", {
            onInit: function () {
                this.oView = this.getView();
                this.oResourceBundle = this.getResourceBundle();
                let oLocalModelData = new JSONModel({
                    leaderBoards: []
                });
                this.oView.setModel(oLocalModelData, "local");

                this.getRouter("leaderBoard").attachRouteMatched(this._onRouteMatched, this);
            },
            /**************************************************************************************************************************************************
             * PRIVATE METHOD
             **************************************************************************************************************************************************/
            _onRouteMatched: function (oEvent) {
                try {
                    let oLocalModal = this.oView.getModel("local");
                    const fakeLeaderBoards = [
                        {
                            "rank": 1,
                            "playerName": "Tom Wilson",
                            "playerEmail": "tom.wilson@example.com",
                            "wins": 4,
                            "score": 92
                        },
                        {
                            "rank": 2,
                            "playerName": "Michael Johnson",
                            "playerEmail": "michael.johnson@example.com",
                            "wins": 3,
                            "score": 91
                        },
                        {
                            "rank": 3,
                            "playerName": "Chris Anderson",
                            "playerEmail": "chris.anderson@example.com",
                            "wins": 3,
                            "score": 88
                        },
                        {
                            "rank": 4,
                            "playerName": "John Doe",
                            "playerEmail": "john.doe@example.com",
                            "wins": 3,
                            "score": 87
                        },
                        {
                            "rank": 5,
                            "playerName": "David Lee",
                            "playerEmail": "david.lee@example.com",
                            "wins": 2,
                            "score": 85
                        },
                        {
                            "rank": 6,
                            "playerName": "Sarah Davis",
                            "playerEmail": "sarah.davis@example.com",
                            "wins": 1,
                            "score": 78
                        },
                        {
                            "rank": 7,
                            "playerName": "Rachel Garcia",
                            "playerEmail": "rachel.garcia@example.com",
                            "wins": 1,
                            "score": 75
                        },
                        {
                            "rank": 8,
                            "playerName": "Jane Smith",
                            "playerEmail": "jane.smith@example.com",
                            "wins": 0,
                            "score": 72
                        },
                        {
                            "rank": 9,
                            "playerName": "Lisa Taylor",
                            "playerEmail": "lisa.taylor@example.com",
                            "wins": 0,
                            "score": 69
                        },
                        {
                            "rank": 10,
                            "playerName": "Emily Brown",
                            "playerEmail": "emily.brown@example.com",
                            "wins": 0,
                            "score": 65
                        }
                    ];
                    if (UICommon.fnIsDevEnv()) {
                        oLocalModal.setProperty("/leaderBoards", fakeLeaderBoards);
                        oLocalModal.refresh();
                    }
                } catch (error) {
                    console.log(`_onRouteMatched - Error: ${error}`);
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }
            },

            //EOF
        });
    });
