sap.ui.define([
    "cap/euro/bettor/soccer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "cap/euro/bettor/soccer/model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "cap/euro/bettor/soccer/utils/UICommon",
    "cap/euro/bettor/soccer/constants/AppGlobalConstant",
], function (BaseController, JSONModel, Filter, FilterOperator, formatter, MessageToast, MessageBox, UICommon, AppGlobalConstant) {
    "use strict";

    return BaseController.extend("cap.euro.bettor.soccer.controller.BetMatch", {
        formatter: formatter,
        onInit: function () {
            this.getRouter().getRoute("betMatch").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: async function (oEvent) {
            try {
                this.showBusy();
                this._matchId = oEvent.getParameter("arguments").matchId;
                if (UICommon.fnIsEmpty(this._matchId)) {
                    this.hideBusy();
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }

                this._matchId = parseInt(this._matchId);
                let oData = {
                    "enabledBetBtn": true,
                    "predictOptions": [],
                    "predictGoals": [],
                    "team_win_ID": "",
                    "isDraw": false,
                    "userId": "",
                    "betMatchID": "",
                    "matchStatus": 1,
                    "matchPredicts": 0,
                    "matchBetItems":[]
                };

                // set explored app's demo model on this sample
                let oModel = new JSONModel(oData);
                this.setModel(oModel, "viewModel");

                let matchPath = `/Matches(${this._matchId})`;

                this._layout = oEvent.getParameter("arguments").layout;
                this.getView().bindElement({
                    path: matchPath,
                    model: "mainModel",
                    parameters: {
                        $select: "*",
                        expand: "team1,team2"
                    }
                });

                this.getModel("layoutMod").setProperty("/layout", this._layout);

                let matchContextBinding = this.getModel("mainModel").bindContext(matchPath, null, {
                    $expand: {
                        "team1": {
                            $select: ["team_name"]
                        },
                        "team2": {
                            $select: ["team_name"]
                        }
                    }
                });

                let matchContext = await matchContextBinding.requestObject();
                //Set visible result
                const oResultBox = this.getView().byId("vbResult");
                if (oResultBox) {
                    UICommon.devLog(`Visible Result by Status: ${matchContext.status}`);
                    const { MATCH_STATUS } = AppGlobalConstant;
                    oResultBox.setVisible(matchContext.status == MATCH_STATUS.DONE);
                    oModel.setProperty("/matchStatus", matchContext.status);//using for formatter
                }
                let matchPredicts = matchContext.predicts;
                oModel.setProperty("/matchPredicts",matchPredicts);
                
                let predictGoals = [];
                for (let i = 0; i < matchPredicts; i++) {
                    predictGoals.push({
                        "predict": i + 1,
                        "team1_numOfGoals": null,
                        "team2_numOfGoals": null
                    });

                }
                oModel.setProperty("/predictGoals", predictGoals);
                const aPredictOptions =  [
                    {
                        "team_name": matchContext.team1.team_name,
                        "team_id": parseInt(matchContext.team1_ID)
                    },
                    {
                        "team_name": matchContext.team2.team_name,
                        "team_id": parseInt(matchContext.team2_ID)
                    }
                ];
                oModel.setProperty("/predictOptions",aPredictOptions);

                const matchTime = matchContext.match_time;
                const matchDateTime = new Date(matchTime);
                const instant = new Date();
                const matchDate = new Date(matchDateTime.toDateString());
                const today = new Date(instant.toDateString());
                // oModel.setProperty("/enabledBetBtn", matchDate < today ? false : true);//Old Logic based on bet date
                oModel.setProperty("/enabledBetBtn", !matchContext.isOver);//Leo: Hotfix based on isOver

                //Get logged user
                let getUserInfoContextBinding = this.getModel("mainModel").bindContext("/GetUserInfo(...)");
                await getUserInfoContextBinding.invoke();
                let email = getUserInfoContextBinding.getBoundContext().getObject().id;

                const userFilters = new Filter("email", "EQ", email);
                const usersFiltered = await this._filterUsers(userFilters);
                const userId = usersFiltered?.[0]?.user_id;
                if (UICommon.fnIsEmpty(userId)) {
                    this.hideBusy();
                    MessageBox.error(this.getGeneralTechnicalIssueMsg());
                    return;
                }

                oModel.setProperty("/userId", userId);

                //Get match bets
                const oMatchBetFilters = this._buildMatchBetFilter(this._matchId);
                let aMatchBetItems = await this._getMatchBets(oMatchBetFilters);
                if (aMatchBetItems && aMatchBetItems.length > 0) {
                    //Get Match for upsert by userId, matchId
                    const betMatch = UICommon.fnFindObjectInArray(aMatchBetItems, "user_ID", userId);
                    if(betMatch && betMatch!=null){
                        UICommon.devLog(`Found exist betMatch User: ${userId} - MatchId: ${this._matchId}`);
                        oModel.setProperty("/team_win_ID", betMatch.team_win_ID);
                        oModel.setProperty("/isDraw", betMatch.isDraw);
                        //Handle load predict base on mathPredicts
                        const aBetMatchPredictGoals = betMatch.predictGoals;
                        let aUserBetPredictGoals = [];
                        UICommon.devLog(`matchPredicts: ${matchPredicts}`);
                        if(matchPredicts != 0){
                            for (let i = 0; i < matchPredicts; i++) {
                                const oPredictGoal = aBetMatchPredictGoals[i];//if got bet match predicts set it to UI if NOT do nothing
                                if(oPredictGoal){
                                    aUserBetPredictGoals.push({
                                        "predict": i + 1,
                                        "team1_numOfGoals": oPredictGoal.team1_numOfGoals,
                                        "team2_numOfGoals": oPredictGoal.team2_numOfGoals,
                                    });
                                }else{
                                    aUserBetPredictGoals.push({
                                        "predict": i + 1,
                                        "team1_numOfGoals": null,
                                        "team2_numOfGoals": null,
                                    });
                                }      
                            }
                        }
                        oModel.setProperty("/predictGoals",aUserBetPredictGoals);
                        oModel.setProperty("/betMatchID", betMatch.ID);
                    }
                    
                }
                //Bind match bets
                aMatchBetItems.forEach((bet)=>{
                    if(bet.isDraw){
                        return;//skip bet draw
                    }
                    const oTeam = UICommon.fnFindObjectInArray(aPredictOptions, "team_id", bet.team_win_ID);
                    if(oTeam){
                        bet.teamWinName  = oTeam.team_name;
                    }
                });
                oModel.setProperty("/matchBetItems", aMatchBetItems);
                this.hideBusy();


            } catch (error) {
                this.hideBusy();
                console.log(`Route Match - Error:${error}`);
                MessageBox.error(this.getGeneralTechnicalIssueMsg());
                return;

            }
        },

        handleTeamWinChange: function (oEvent) {
            let viewModel = this.getModel("viewModel");
            viewModel.setProperty("/team_win_ID", parseInt(oEvent.getSource().getSelectedItem().getAdditionalText()));
        },



        handleSave: async function () {
            this.showBusy();
            try {

                const viewModel = this.getModel("viewModel");
                const userId = viewModel.getProperty("/userId");

                if (this._validateBetMatch()) {
                    const listBinding = this.getModel("mainModel").bindList("/Bets");
                    const predictOptions = viewModel.getProperty("/predictOptions");
                    const team1_ID = predictOptions[0].team_id;
                    const team2_ID = predictOptions[1].team_id;
                    const predictGoals = viewModel.getProperty("/predictGoals");
                    const betMatchID = viewModel.getProperty("/betMatchID");
                    let predictGoalsPayload = predictGoals.map((predictGoal) => {
                        return {
                            "team1_ID": team1_ID,
                            "team1_numOfGoals": predictGoal.team1_numOfGoals ? parseInt(predictGoal.team1_numOfGoals) : 0,
                            "team2_ID": team2_ID,
                            "team2_numOfGoals": predictGoal.team2_numOfGoals ? parseInt(predictGoal.team2_numOfGoals) : 0,
                        }
                    });

                    if (betMatchID) {
                        let betMatchPath = `/Bets(${betMatchID})`;
                        await this.getModel("mainModel").delete(betMatchPath, "$single");
                        // let betMatchContextBinding = this.getModel("mainModel").bindContext(betMatchPath);
                        // const boundContext = await betMatchContextBinding.getBoundContext();
                        // boundContext.setProperty("team_win_ID", parseInt(viewModel.getProperty("/team_win_ID")));
                        // boundContext.setProperty("isDraw", viewModel.getProperty("/isDraw"));
                        // boundContext.setProperty("predictGoals", predictGoalsPayload);

                    }

                    let context = listBinding.create({
                        "user_ID": userId,
                        "bet_time": new Date().toISOString(),
                        "match_ID": this._matchId,
                        "team_win_ID": parseInt(viewModel.getProperty("/team_win_ID")),
                        "isDraw": viewModel.getProperty("/isDraw"),
                        "predictGoals": predictGoalsPayload
                    });

                    let oView = this.getView();

                    // lock UI until submitBatch is resolved, to prevent errors caused by updates while submitBatch is pending
                    oView.setBusy(true);

                    let fnSuccess = function (oResponse) {
                        console.log(`Success response:${oResponse}`);
                        oView.setBusy(false);
                        this.hideBusy();
                        MessageToast.show("Bet Saved Successfully");
                    }.bind(this);

                    let fnError = function (oError) {
                        oView.setBusy(false);
                        this.hideBusy();
                        MessageBox.error(oError.message);
                    }.bind(this);

                    this.getModel("mainModel").submitBatch("UpdateGroup").then(fnSuccess, fnError);
                    // this.getRouter().navTo("matchList");
                }
                this.hideBusy();
            } catch (error) {
                this.hideBusy();
                console.log(`handleSave - Error:${error}`);
                MessageBox.error(this.getGeneralTechnicalIssueMsg());
                return;
            }
        },

        handleClose: function (oEvent) {
            this.getModel("mainModel").resetChanges("UpdateGroup");
            this.getRouter().navTo("matchList");
        },

        handleNumberofGoalsChange: function (oEvent) {
            const oSource = oEvent.getSource();
            let oModel = this.getModel("viewModel");
            //Hot fix fore golive optimize later
            let oCurrentPredict = oSource.getBindingContext("viewModel").getObject();
            const currentPath = oSource.getBindingContext("viewModel").sPath;
            if (oSource.getId().includes('goalTeam1')) {
                // teamGoalPath = "team2_numOfGoals"
                oCurrentPredict.team1_numOfGoals = oSource.getValue();;
            } else {
                oCurrentPredict.team2_numOfGoals = oSource.getValue();
            }
            oModel.setProperty(`${currentPath}`, oCurrentPredict);
            oModel.refresh();
            const predictGoals = oModel.getProperty("/predictGoals");
            let invalidNumberofGoals = predictGoals.some(function (el) {
                return (
                    (UICommon.fnIsNumber(el.team1_numOfGoals) && UICommon.fnIsEmpty(el.team2_numOfGoals)) ||
                    (UICommon.fnIsNumber(el.team2_numOfGoals) && UICommon.fnIsEmpty(el.team1_numOfGoals)) ||
                    isNaN(parseInt(el.team1_numOfGoals)) || parseInt(el.team1_numOfGoals) < 0 ||
                    isNaN(parseInt(el.team2_numOfGoals)) || parseInt(el.team2_numOfGoals) < 0
                );
            });

            oModel.setProperty("/enabledBetBtn", !invalidNumberofGoals);
        },
        /**************************************************************************************************************************************************
        * PRIVATE METHOD
        **************************************************************************************************************************************************/
        _filterUsers: async function (filters) {
            const usersBinding = this.getModel("mainModel").bindList("/Users", {
                "$select": "user_ID"
            }).filter(filters);//use new listbinding instance - otherwise not all books will be in the list
            const usersContext = await usersBinding.requestContexts();

            return usersContext.map(userContext => userContext.getObject());
        },

        _buildFilterBetMatch: function (user_ID, match_ID) {
            let filters = [
                new Filter("user_ID", "EQ", user_ID),
                new Filter("match_ID", "EQ", match_ID),
            ]

            return new Filter({
                "filters": filters,
                "and": true
            })
        },

        _filterBetMatches: async function (filters) {
            const betMatchesBinding = this.getModel("mainModel").bindList("/Bets").filter(filters);//use new listbinding instance - otherwise not all books will be in the list
            const betMatchesContext = await betMatchesBinding.requestContexts();

            return betMatchesContext.map(betMatchContext => betMatchContext.getObject());
        },

        _validateBetMatch: function () {
            const viewModel = this.getModel("viewModel");
            const userId = viewModel.getProperty("/userId");
            let valid = true;

            if (!userId) {
                MessageBox.error("User not found");
                return false;
            }

            return valid;
        },
        _buildMatchBetFilter: function (matchId) {
            let filters = [
                new Filter("match_ID", "EQ", matchId),
            ]
            return new Filter({
                "filters": filters,
                "and": true
            })
        },

        _getMatchBets: async function (filters) {
            try {
                //use new listbinding instance
                const matchBetsBinding = this.getModel("mainModel").bindList("/Bets", null, null, filters, {
                    $expand: "user($select=user_id,email,fullName),match($select=match_id,match_name,team_win_ID,match_time)",
                    $orderby: "bet_time desc"
                });

                const matchBetContexts = await matchBetsBinding.requestContexts();

                return matchBetContexts.map(matchBetContext => matchBetContext.getObject());
            } catch (error) {
                console.error(`_getMatchBets - error: ${error.message}`);
                throw error;
            }
        }
    });
});
