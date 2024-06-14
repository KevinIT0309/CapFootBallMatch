sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
    "cap/euro/bettor/soccer/utils/UICommon"
],
    function (BaseController, JSONModel, MessageBox, Filter, FilterOperator, formatter, UICommon) {
        "use strict";

        return BaseController.extend("cap.euro.bettor.soccer.controller.LeaderBoard", {
            formatter: formatter,
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
                            "winning": 4,
                            "score": 92
                        },
                        {
                            "rank": 2,
                            "playerName": "Michael Johnson",
                            "playerEmail": "michael.johnson@example.com",
                            "winning": 3,
                            "score": 91
                        },
                        {
                            "rank": 3,
                            "playerName": "Chris Anderson",
                            "playerEmail": "chris.anderson@example.com",
                            "winning": 3,
                            "score": 88
                        },
                        {
                            "rank": 4,
                            "playerName": "John Doe",
                            "playerEmail": "john.doe@example.com",
                            "winning": 3,
                            "score": 87
                        },
                        {
                            "rank": 5,
                            "playerName": "David Lee",
                            "playerEmail": "david.lee@example.com",
                            "winning": 2,
                            "score": 85
                        },
                        {
                            "rank": 6,
                            "playerName": "Sarah Davis",
                            "playerEmail": "sarah.davis@example.com",
                            "winning": 1,
                            "score": 78
                        },
                        {
                            "rank": 7,
                            "playerName": "Rachel Garcia",
                            "playerEmail": "rachel.garcia@example.com",
                            "winning": 1,
                            "score": 75
                        },
                        {
                            "rank": 8,
                            "playerName": "Jane Smith",
                            "playerEmail": "jane.smith@example.com",
                            "winning": 0,
                            "score": 72
                        },
                        {
                            "rank": 9,
                            "playerName": "Lisa Taylor",
                            "playerEmail": "lisa.taylor@example.com",
                            "winning": 0,
                            "score": 69
                        },
                        {
                            "rank": 10,
                            "playerName": "Emily Brown",
                            "playerEmail": "emily.brown@example.com",
                            "winning": 0,
                            "score": 65
                        }
                    ];
                    if (UICommon.fnIsDevEnv()) {
                        const aLeaderBoards = this._buildLeaderBoardList(fakeLeaderBoards);
                        oLocalModal.setProperty("/leaderBoards", aLeaderBoards);
                        oLocalModal.refresh();
                    }
                } catch (error) {
                    console.log(`_onRouteMatched - Error: ${error}`);
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }
            },
            _buildLeaderBoardList: function(leaderBoads){
                const aFinalLeaderBoards = [];
                leaderBoads.forEach((leaderBoardItem)=>{
                    leaderBoardItem.badge = formatter.fnGetLeaderBoardBadge(leaderBoardItem.rank);
                    aFinalLeaderBoards.push(leaderBoardItem);
                });
                return aFinalLeaderBoards;
            }
            //EOF
        });
    });
