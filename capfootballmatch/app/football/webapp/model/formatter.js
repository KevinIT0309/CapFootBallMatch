sap.ui.define([ "cap/euro/admin/football/constants/AppGlobalConstant"], (AppGlobalConstant) => {
    "use strict";

    return {
        getMatchStatusText: function (status) {
            switch (status) {
                case "1":
                    return "Waiting";
                case "2":
                    return "Ongoing";
                case "3":
                    return "Done";
                default:
                    return status;
            }
        },
        fnGetMatchStatusState: function (status) {
            try {
                const { MATCH_STATUS_CONF } = AppGlobalConstant;
                if (MATCH_STATUS_CONF[status]) {
                    return MATCH_STATUS_CONF[status].state;
                }
                return status;
            } catch (error) {
                console.log(`fnGetMatchStatusState - Error: ${error}`);
                return status;
            }

        },
    };
});