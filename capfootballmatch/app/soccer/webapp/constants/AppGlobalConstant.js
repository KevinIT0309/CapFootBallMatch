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
        1: { text: "Betting", state: "Warning" },
        2: { text: "On Going", state: "Error" },
        3: { text: "Finished", state: "Success" }
    };
    const DATE_CONFIG = {
        UTC_TIMEZONE_OFFSET: -120, //Offset in minutes (negative because it's UTC+2)
        DATE_FORMAT_PATTERN: "yyyy/MM/dd",
        DATE_FORMAT_TIME_PATTERN: "yyyy/MM/dd HH:mm:ss",
        DATE_FORMAT_DB_PATTERN: "yyyy/MM/dd",//TBD later
        DATE_FORMAT_DB_TIME_PATTERN: "yyyy/MM/dd HH:mm:ss",//TBD later
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
            "stageName": "Group"
        },
        {
            "stage": "2",
            "stageName": "1/16"
        },
        {
            "stage": "3",
            "stageName": "1/8"
        },
        {
            "stage": "4",
            "stageName": "Semi Final"
        },
        {
            "stage": "5",
            "stageName": "Final"
        }
    ];

    return {
        MATCH_STATUS: MATCH_STATUS,
        MATCH_STATUS_CONF: MATCH_STATUS_CONF,
        DATE_CONFIG: DATE_CONFIG,
        MATCH_STAGE_MULTIPLIER: MATCH_STAGE_MULTIPLIER,
        MATCH_STAGE: MATCH_STAGE
    };
});