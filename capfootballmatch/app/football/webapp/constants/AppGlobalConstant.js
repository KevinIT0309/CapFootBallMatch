/**
 * Global Apps Status Contents
 * created: TinhLeo
 * created Date: 16/06/2024
 * Change logs
 * - 16/06/2024: Inital version
 * */
sap.ui.define([
], function (Filter, FilterOperator) {
    "use strict";
    //waiting = 1; ongoing = 2; done = 3; 
    const MATCH_STATUS = {
        WAITING: 1,
        ONGOING: 2,
        DONE: 3
    };
    const MATCH_STATUS_CONF = {
        1: { text: "Waiting", state: "Warning" },
        2: { text: "On Going", state: "Error" },
        3: { text: "Done", state: "Success" }
    };

    const MATCH_STAGE_MULTIPLIER = {
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 6.5
    };
    
    const MATCH_STAGE = [
        {
            "stage": "1",
            "stageName":"Group"
        },
        {
            "stage": "2",
            "stageName":"Round of 1/16"
        },
        {
            "stage": "3",
            "stageName":"Round of 1/8"
        },
        {
            "stage": "4",
            "stageName":"Semi Final"
        },
        {
            "stage": "5",
            "stageName":"Final"
        }
    ];

    return {
        MATCH_STATUS: MATCH_STATUS,
        MATCH_STATUS_CONF: MATCH_STATUS_CONF,
        MATCH_STAGE_MULTIPLIER:MATCH_STAGE_MULTIPLIER,
        MATCH_STAGE: MATCH_STAGE
    };
});