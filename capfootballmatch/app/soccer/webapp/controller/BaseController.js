sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/core/BusyIndicator"
], function (Controller, History, UIComponent, BusyIndicator) {

    "use strict";
    return Controller.extend("cap.euro.bettor.soccer.controller.BaseController", {
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

        getGeneralTechnicalIssueMsg: function () {
            return this.getResourceBundle().getText("generalTechnicalIssue");
        },
        /**
         * Turn off the loading icon - hiding busy indicator
         */
        hideBusy: function () {
            BusyIndicator.hide();
        },

        /**
         * Turn on the loading icon - showing busy indicator
         */
        showBusy: function () {
            BusyIndicator.show(0);
        },
        getFMSrvPath: function () {
            const oFMSrvModel = this.getModel("mainModel");
            if (oFMSrvModel) {
                return `${oFMSrvModel.sServiceUrl}`;
            }
            return "";
        },
    });
});