sap.ui.define([], () => {
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
        }
    };
});