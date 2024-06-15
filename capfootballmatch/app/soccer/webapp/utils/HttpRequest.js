/**
 * Http Request Utililty
 * created by: TinhLeo
 * created Date: 15/06/2024
 * Change logs:
 *  - 15/06/2024 (TinhLeo): Initial version
 * */
sap.ui.define(
    [
        "sap/ui/core/BusyIndicator",
        "sap/base/Log",
        "sap/m/MessageBox",
        "cap/euro/bettor/soccer/utils/UICommon",
    ],
    function (BusyIndicator, Log, MessageBox, UICommon) {
        "use strict";

        return {
            _oLogger: Log.getLogger("cap.euro.bettor.soccer.utils.HttpRequest"),
            /**
             * Send GET type HTTP request using jquery ajax (expect json data type response by default)
             * @param {string} url - url to which the request is sent
             * @param {function} fnSuccess - callback function called when the request succeeds
             * @param {function} fnError - callback function called when the request fails
             * @param {Object} oSettings - Custom settings for ajax function in key-value format (currently support: headers, async, cache, dataType)
             */
            getData: function (url, fnSuccess, fnError, oSettings = {}) {
                let {
                    headers = {},
                    async = true,
                    cache = true,
                    dataType = "json",
                } = oSettings;

                return $.ajax({
                    url: url,
                    type: "GET",
                    dataType: dataType,
                    cache: cache,
                    headers: {
                        "Accept-Language": sap.ui.getCore().getConfiguration().getLanguage(),
                        ...headers,
                    },
                    success: (data) => {
                        if (fnSuccess) {
                            fnSuccess(data);
                        }
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        if (fnError) {
                            fnError(error);
                            return;
                        }
                        //call common error
                        let sMessage = this.fnHandleParseErrorMessage(error);
                        MessageBox.error(sMessage);
                        console.log("HttpRequest -  Get Data Error: ", error);
                    },
                    async: async,
                });
            },

            /**
             * Send POST type HTTP request using jquery ajax (expect json data type response by default)
             * @param {string} url - url to which the request is sent
             * @param {Object} oSubmitData - input data to be submit with the request
             * @param {function} fnSuccess - callback function called when the request succeeds
             * @param {function} fnError - callback function called when the request fails
             * @param {Object} oSettings - Custom settings for ajax function in key-value format (currently support: headers, async, contentType, dataType)
             */
            postData: function (url, oSubmitData, fnSuccess, fnError, oSettings = {}) {
                let {
                    headers = {},
                    async = true,
                    dataType = "json",
                    contentType = "application/json; charset=utf-8",
                } = oSettings;

                return $.ajax({
                    url: url, // url
                    type: "POST", // Request type - Post
                    dataType: dataType, // Return datatype,
                    contentType: contentType,
                    data: JSON.stringify(oSubmitData),
                    headers: {
                        "Accept-Language": sap.ui.getCore().getConfiguration().getLanguage(),
                        ...headers,
                    },
                    success: (response) => {
                        if (fnSuccess) {
                            fnSuccess(response);
                        }
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        if (fnError) {
                            fnError(error);
                            return;
                        }
                        //call common error
                        let sMessage = this.fnHandleParseErrorMessage(error);
                        MessageBox.error(sMessage);
                        console.log("HttpRequest - Post Data Error: ", error);
                    },
                    async: async,
                });
            },

            /**
             * Send PATH type HTTP request using jquery ajax (expect json data type response by default)
             * @param {string} url - url to which the request is sent
             * @param {Object} oPayload - input data to be submit with the request
             * @param {function} fnSuccess - callback function called when the request succeeds
             * @param {function} fnError - callback function called when the request fails
             * @param {string} method - PUT/PATCH
             * @param {Object} oSettings - Custom settings for ajax function in key-value format (currently support: headers, async, contentType, dataType)
             * @param {Boolean} bStringify - should submit payload be stringified
             */
            updateData: function (url, oPayload, fnSuccess, fnError, method = "PATCH", oSettings = {}, bStringify = true) {
                let {
                    headers = {},
                    async = true,
                    dataType = "json",
                    contentType = "application/json; charset=utf-8",
                    processData = true,
                } = oSettings;

                return $.ajax({
                    url: url, // url
                    type: method, // Request type - PUT/PATCH
                    dataType: dataType, // Return datatype,
                    contentType: contentType,
                    data: bStringify ? JSON.stringify(oPayload) : oPayload,
                    processData: processData,
                    headers: {
                        "Accept-Language": sap.ui.getCore().getConfiguration().getLanguage(),
                        ...headers,
                    },
                    success: (response) => {
                        if (fnSuccess) {
                            fnSuccess(response);
                        }
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        if (fnError) {
                            fnError(error);
                            return;
                        }
                        //call common error
                        let sMessage = this.fnHandleParseErrorMessage(error);
                        MessageBox.error(sMessage);
                        console.log("HttpRequest - Put Data Error: ", error);
                    },
                    async: async,
                });
            },

            /**
             * Send PATH type HTTP request using jquery ajax (expect json data type response by default)
             * @param {string} url - url to which the request is sent
             * @param {Object} oPayload - input data to be submit with the request
             * @param {function} fnSuccess - callback function called when the request succeeds
             * @param {function} fnError - callback function called when the request fails
             * @param {Object} oSettings - Custom settings for ajax function in key-value format (currently support: headers, async, contentType, dataType)
             */
            deleteData: function (url, oPayload, fnSuccess, fnError, method = "DELETE", oSettings = {}) {
                let {
                    headers = {},
                    async = true,
                    dataType = "json",
                    contentType = "application/json; charset=utf-8",
                } = oSettings;

                return $.ajax({
                    url: url, // url
                    type: method, // Request type - DELETE/POST
                    dataType: dataType, // Return datatype,
                    contentType: contentType,
                    data: JSON.stringify(oPayload),
                    headers: {
                        "Accept-Language": sap.ui.getCore().getConfiguration().getLanguage(),
                        ...headers,
                    },
                    success: (response) => {
                        if (fnSuccess) {
                            fnSuccess(response);
                        }
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        if (fnError) {
                            fnError(error);
                            return;
                        }
                        //call common error
                        let sMessage = this.fnHandleParseErrorMessage(error);
                        MessageBox.error(sMessage);
                        console.log("HttpRequest - deleteData - Delete Data Error: ", error);
                    },
                    async: async,
                });
            },


            /******************************************************************************************
             ***************************************INTERNAL FUNCTION**********************************
             *******************************************************************************************/
            /**
             * Parse error message from the oError object returned from BE
             * @param {Object} oError - Error object
             */
            fnHandleParseErrorMessage: function (oError) {
                const sGeneralErrorMsg = "Something went wrong. Please get in touch with the Technical team for support!";
                const sGeneralErrorLog = "HttpRequest - fnHandleParseErrorMessage - Error Parse oError Response: ";
                let sErrorMsg = sGeneralErrorMsg;
                if (!oError) {
                    console.log(sGeneralErrorLog, oError);
                    return sErrorMsg;
                }
                try {
                    let oResponseErrorParse = null;
                    if (oError.responseJSON) {
                        oResponseErrorParse = oError.responseJSON;
                        sErrorMsg = oResponseErrorParse ? oResponseErrorParse.error.message : sGeneralErrorMsg;
                        return sErrorMsg;
                    }

                    if (!oResponseErrorParse || $.isEmptyObject(oResponseErrorParse)) {
                        if (UICommon.fnIsValidJSON(oError.responseText)) {
                            oResponseErrorParse = JSON.parse(oError.responseText);

                            // let oResponseText = oResponseErrorParse.responseText ? oResponseErrorParse.responseText : {};
                            sErrorMsg = oResponseErrorParse ? oResponseErrorParse.error.message : sGeneralErrorMsg;
                            return sErrorMsg;
                        }
                        sErrorMsg = oError.responseText;

                    }

                } catch (error) {
                    console.log(sGeneralErrorLog, error);
                    return sErrorMsg;
                }

                return sErrorMsg;
            }
            //end func list
        };
    }
);

