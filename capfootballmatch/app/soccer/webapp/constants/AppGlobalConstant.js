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
        DATE_FORMAT_TIME_PATTERN:"yyyy/MM/dd HH:mm:ss",
        DATE_FORMAT_DB_PATTERN: "yyyy/MM/dd",//TBD later
        DATE_FORMAT_DB_TIME_PATTERN: "yyyy/MM/dd HH:mm:ss",//TBD later
    };
    return {
        MATCH_STATUS: MATCH_STATUS,
        MATCH_STATUS_CONF: MATCH_STATUS_CONF,
        DATE_CONFIG: DATE_CONFIG
    };
});