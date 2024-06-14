sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
], function (Controller, History, UIComponent) {

    "use strict";
    return Controller.extend("cap.euro.admin.football.controller.BaseController", {
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        // onNavBack: function() {
        //     var oHistory, sPreviousHash;
        //     oHistory = History.getInstance();
        //     sPreviousHash = oHistory.getPreviousHash();
        //     if (sPreviousHash !== undefined) {
        //         window.history.go(-1);
        //     } else {
        //         this.getRouter().navTo("appHome", {}, true /*no history*/);
        //     }
        // }
    });
});