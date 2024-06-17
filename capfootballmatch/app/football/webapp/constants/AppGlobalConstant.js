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

    return {
        MATCH_STATUS: MATCH_STATUS,
        MATCH_STATUS_CONF: MATCH_STATUS_CONF
    };
});