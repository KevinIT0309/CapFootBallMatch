/**
 * UI Utility
 * created by: TinhLeo
 * created Date: 14/06/2024
 * Change logs:
 *  - 14/06/2024 (TinhLeo): Initial version
 * */
sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "cap/euro/bettor/soccer/constants/AppGlobalConstant",
], function (DateFormat, JSONModel, MessageBox, AppGlobalConstant) {
    "use strict";
    return {
        DEFAULT_CONVERSION_ROUTINE: 0,
        FIXED_FLOAT_NUMBER: 3,
        LOG_INFO: "I",
        LOG_ERROR: "E",
        /**
         *
         * @param aSources - Source array want to sort
         * @sortType - accept: ASC, DESC
         * @sortColumn - name of column in array
         * @bFillterNullSortColValue - default is false accept: true, false
         * @returns - sorted array
         * */
        fnSortArrayObject: function (
            aSources,
            sortType,
            sortColumn,
            bFilterNullSortColValue = false
        ) {
            if (!aSources || aSources === undefined) {
                //@ts-ignore
                console.error("UICommon - fnSortArrayObject - Invalid Source: ", aSources);
                return [];
            }
            // Remove objects with null value for sortColumn
            if (bFilterNullSortColValue) {
                aSources = aSources.filter((item) => item[sortColumn] !== null);
            }

            // Sort the array based on sortColumn and sortType
            aSources.sort((a, b) => {
                if (sortType === "ASC") {
                    return a[sortColumn] - b[sortColumn];
                } else if (sortType === "DESC") {
                    return b[sortColumn] - a[sortColumn];
                }
                //@ts-ignore
                console.error("UICommon - fnSortArrayObject - Invalid Sort Type: ", sortType);
                return [];
            });

            return aSources;
        },
        fnHandleResponseException: function (error) {
            let oError = error.responseJSON;
            let sMessage = "";
            if (!oError) {
                sMessage = "Request Failed"; //should return common message by i18n
            } else {
                //handle basic error
                if (oError.message) {
                    sMessage = oError.message || error.responseText;
                }
                //handle custom error
                if (oError.data) {
                    if (oError.data.message) {
                        sMessage = sMessage + " " + oError.data.message;
                    }
                }
                //handle odata error
                if (sMessage === "") {
                    if (oError.error) {
                        sMessage = oError.error.message;
                    }
                }
                //@ts-ignore
                console.error("UICommon - fnHandleResponseException - error: ", JSON.stringify(oError.data ? oError.data.stack : oError.message));
            }
            return sMessage;
        },
        fnGetCurrDateByFormat: function (sFormatPattern = "yyyy-MM-dd") {
            try {
                let sCurrDate = new Date();
                const DateFormatter = DateFormat.getDateInstance({
                    pattern: sFormatPattern,
                });
                return DateFormatter.format(sCurrDate);
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnGetCurrDateByFormat - error: ", error);
            }
        },
        fnIsZeroValue: function (sValue) {
            if (sValue === "0" || sValue === 0) {
                return true;
            }
            return false;
        },
        fnFindObjectInArray: function (array, property, value) {
            if (!array || !property || !value) {
                return null;
            }
            return array.find((obj) => obj[property] === value);
        },
        fnIsValidJSON: function (jsonString) {
            try {
                JSON.parse(jsonString);
                return true;
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnIsValidJSON - error: ", error);
                return false;
            }
        },
        fnIsDevEnv: function () {
            //@ts-ignore
            const sOriginUri = window.location.origin;
            const sBASUri = "applicationstudio.cloud.sap";
            if (sOriginUri.includes(sBASUri)) {
                return true;
            }
            return false;
        },
        fnGenUUID: function (version = 4) {
            return crypto.randomUUID();//for now by default v4

        },
        fnShowTechnicalIssue: function () {
            const sGeneralMsg = "Something went wrong. Please get in touch with the Technical team for support!";
            MessageBox.error(sGeneralMsg);
        },
        /**
        * 
        * @param {*} sDateRaw: String of datetime
        * @returns formated DateTime
        */
        fnDisplayDateAndTime: function (sDateRaw) {
            try {
                if (sDateRaw) {
                    const inputDate = new Date(sDateRaw);

                    // Extract date components
                    const year = inputDate.getFullYear() % 100; // Get the last two digits of the year
                    const month = inputDate.getMonth() + 1; // Months are zero-based, so add 1
                    const day = inputDate.getDate();
                    const hours = inputDate.getHours();
                    const minutes = inputDate.getMinutes();

                    // Determine AM or PM
                    const amOrPm = hours >= 12 ? 'PM' : 'AM';

                    // Convert hours to 12-hour format
                    const formattedHours = hours % 12 || 12; // '0' should be displayed as '12'

                    // Pad single-digit day and month with leading zeros
                    const formattedMonth = month.toString().padStart(2, '0');
                    const formattedDay = day.toString().padStart(2, '0');

                    // Format the date string
                    const formattedDateString = `${formattedMonth}/${formattedDay}/${year} at ${formattedHours}:${minutes.toString().padStart(2, '0')} ${amOrPm}`;
                    if (new Date(formattedDateString) instanceof Date) {
                        return formattedDateString;
                    } else {
                        return "";
                    }

                }
                return "";
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnDisplayDateAndTime - error: ", error);
                return "Parse Date Failed";
            }

        },
        /**
         * @param {Object} oSourceObject
         * @param {String} value
         */
        fnGetKeyByValue(oSourceObject, value) {
            try {
                return Object.keys(oSourceObject).find(key => oSourceObject[key] === value);
            } catch (error) {
                //@ts-ignore
                console.error(`UICommon - fnGetKeyByValue - error: ${error}`);
                return "";

            }

        },
        /**
         * 
         * @param {*} logs 
         * @param {String} sType 
         */
        log: function (logs, sType = this.LOG_INFO) {

            if (sType === this.LOG_INFO) {
                //@ts-ignore
                console.log(logs);
            }

            if (sType === this.LOG_ERROR) {
                //@ts-ignore
                console.error(logs);
            }

        },
        /**
        * 
        * @param {*} logs 
        * @param {String} sType 
        */
        devLog: function (logs, sType = this.LOG_INFO) {
            if (!this.fnIsDevEnv()) {
                return;
            }

            if (sType === this.LOG_INFO) {
                //@ts-ignore
                console.log(logs);
            }

            if (sType === this.LOG_ERROR) {
                //@ts-ignore
                console.error(logs);
            }

        },
        fnGetDeviceData: function () {
            const oDeviceModel = sap.ui.getCore().getModel("device");
            if (oDeviceModel) {
                //@ts-ignore
                return oDeviceModel.getData();
            }
        },
        fnIsDesktop: function () {
            const oDeviceData = this.fnGetDeviceData();
            return oDeviceData.system.desktop;
        },
        fnIsTablet: function () {
            const oDeviceData = this.fnGetDeviceData();
            return oDeviceData.system.tablet;
        },
        fnIsMobile: function () {
            const oDeviceData = this.fnGetDeviceData();
            return oDeviceData.system.phone;
        },
        fnGetQueryParams: function (url) {
            try {
                const queryParams = {};
                const urlParts = url.split('?');
                if (urlParts.length > 1) {
                    const paramString = urlParts[1];
                    const paramPairs = paramString.split('&');
                    for (const paramPair of paramPairs) {
                        const [key, value] = paramPair.split('=');
                        queryParams[key] = decodeURIComponent(value);
                    }
                }
                return queryParams;
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnGetQueryParams - Err: ", error);
                return [];
            }
        },

        /**
        * 
        * @param {*} sDateRaw: String of datetime
        * @returns formated DateTime
        */
        fnDisplayDate: function (sDateRaw) {
            try {
                const inputDate = new Date(sDateRaw);

                // Extract date components
                const year = inputDate.getUTCFullYear();
                const month = inputDate.getMonth() + 1; // Months are zero-based, so add 1
                const day = inputDate.getDate();

                // Pad single-digit day and month with leading zeros
                const formattedMonth = month.toString().padStart(2, '0');
                const formattedDay = day.toString().padStart(2, '0');

                // Format the date string
                const formattedDateString = `${formattedMonth}/${formattedDay}/${year}`;

                return formattedDateString;
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnDisplayDate - error: ", error);
                return "Parse Date Failed";
            }

        },
        fnGetRouteByHash: function (sRouteHash) {
            try {
                const aHashParts = sRouteHash.split("/");
                let sRouteName = aHashParts[0];
                sRouteName = sRouteName.split("?")[0];
                sRouteName = sRouteName.split("(")[0];
                return sRouteName;
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnGetRouteNameByHash - Err: ", error);
                return "";
            }

        },
        fnRemoveLeadingZeros(inputString) {
            // Parse the string to remove leading zeros
            if (!inputString) {
                return '';
            } else {
                let result = parseInt(inputString).toString();
                return result;
            }
        },
        /**
         * Generates an OData URL filter string based on an array of filter objects.
         * Each filter object contains the column name, operation, field value, and data type.
         * @param {Array} filterArray - An array of filter objects.
         * @returns {string} - The generated OData URL filter string.
         */
        fnGenerateODataFilter: function (filterArray) {
            // Check if the input is an array and if it's empty
            if (!Array.isArray(filterArray) || filterArray.length === 0) {
                return ''; // Return an empty string if the input is not valid
            }

            // Map over the filterArray to generate filter expressions for each filter object
            const filters = filterArray.map(filter => {
                const { fieldName, operation, fieldValue, dataType } = filter;
                // Check if any of the required fields are missing
                if (!fieldName || !operation || fieldValue === undefined || dataType === undefined) {
                    return ''; // Skip this filter object if any required field is missing
                }
                // Convert the field value to the appropriate format based on the data type
                let formattedValue = fieldValue;
                if (dataType === 'string') {
                    formattedValue = `'${fieldValue}'`;
                }
                // Return the filter expression for this filter object
                return `${fieldName} ${operation} ${formattedValue}`;
            }).filter(filter => filter !== ''); // Filter out empty filter expressions

            // Join the filter expressions with 'and' and wrap them with $filter=
            return filters.length > 0 ? `$filter=${filters.join(' and ')}` : ''; // Return the final OData filter string
        },

        /**
       * 
       * @param {*} sDateRaw: String of datetime
       * @returns formated DateTime
       */
        fnDisplayDateByUTC: function (sDateRaw) {
            try {
                const inputDate = new Date(sDateRaw);

                // Extract date components
                const year = inputDate.getUTCFullYear();
                const month = inputDate.getUTCMonth() + 1; // Months are zero-based, so add 1
                const day = inputDate.getUTCDate();

                // Pad single-digit day and month with leading zeros
                const formattedMonth = month.toString().padStart(2, '0');
                const formattedDay = day.toString().padStart(2, '0');

                // Format the date string
                const formattedDateString = `${formattedMonth}/${formattedDay}/${year}`;

                return formattedDateString;
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnDisplayDateByUTC - error: ", error);
                return "Parse Date Failed";
            }

        },
        /**
         * Convert time to end of day 00:00:00
         * @param: oDate
         * @return oDate with time end of day
         * @last modified: Tinh Leo
         * */
        fnToStartDay: function (oDate) {
            try {
                let startOfDayDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
                startOfDayDate.setHours(0, 0, 0, 0);
                return startOfDayDate;
            } catch (error) {
                console.log(`UICommon - fnToStartDay - Error: ${error}`);
                return null;
            }
        },
        /**
         * Convert time to end of day 23:59:59
         * @param: oDate
         * @return oDate with time end of day
         * @last modified: Tinh Leo
         * */
        fnToEndDay: function (oDate) {
            try {
                let endOfDayDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(),);
                endOfDayDate.setHours(23, 59, 59, 999);
                return endOfDayDate;
            } catch (error) {
                console.log(`UICommon - fnToEndDay - Error: ${error}`);
                return null;
            }
        },
        fnGetIsoStartDayAsString: function (oDate) {
            try {
                oDate.setUTCHours(0, 0, 0, 0);
                const isoDateStartDayString = oDate.toISOString();
                return isoDateStartDayString;
            } catch (error) {
                console.log(`UICommon - fnDateToIsoStartDay - Error: ${error}`);
                return null;
            }
        },
        fnGetIsoEndDayAsString: function (oDate) {
            try {
                oDate.setUTCHours(0, 0, 0, 0);
                oDate.setDate(oDate.getDate() + 1);
                oDate.setMilliseconds(oDate.getMilliseconds() - 1);
                const isoDateStartDayString = oDate.toISOString();
                return isoDateStartDayString;
            } catch (error) {
                console.log(`UICommon - fnDateToIsoStartDay - Error: ${error}`);
                return null;
            }
        },
        /**
         * 
         * @param {*} timeZoneOffset
         * @returns 
         */
        fnGetDateStringFormatAsUtcOffset: function (date, formatPattern = AppGlobalConstant.DATE_CONFIG.DATE_FORMAT_TIME_PATTERN, timeZoneOffset = AppGlobalConstant.DATE_CONFIG.UTC_TIMEZONE_OFFSET) {
            try {

                let adjustedDate = new Date(date.getTime() + timeZoneOffset * 60000);

                // Create a date formatter with the desired time zone
                let formatter = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: formatPattern,
                    UTC: true
                });

                // Format the date with the desired time zone
                let formattedDate = formatter.format(adjustedDate);
                return formattedDate;
            } catch (error) {
                console.log(`UICommon - fnDateToIsoStartDay - Error: ${error}`);
                return null;
            }
        },
        fnGetCurrDateStringFormatAsUtcOffset: function () {
            try {
                let date = new Date();
                return this.fnGetDateStringFormatAsUtcOffset(date);
            } catch (error) {
                console.log(`UICommon - fnDateToIsoStartDay - Error: ${error}`);
                return null;
            }
        },
        /**
        * 
        * @param {*} sDateRaw: String of datetime
        * @returns formated DateTime
        */
        fnDisplayYearMonthDay: function (sDateRaw) {
            try {
                if (!sDateRaw) {
                    return;
                }

                const inputDate = new Date(sDateRaw);

                // Extract date components
                const year = inputDate.getUTCFullYear();
                const month = inputDate.getMonth() + 1; // Months are zero-based, so add 1
                const day = inputDate.getDate();

                // Pad single-digit day and month with leading zeros
                const formattedMonth = month.toString().padStart(2, '0');
                const formattedDay = day.toString().padStart(2, '0');

                // Format the date string
                const formattedDateString = `${year}/${formattedMonth}/${formattedDay}`;

                return formattedDateString;
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnDisplayYearMonthDay - error: ", error);
                return "Parse Date Failed";
            }

        },
        /**
         * Generates a string with leading zeros based on the length of the input number and a standard length.
         * 
         * @param {string} sInputNumber - The input number as a string.
         * @param {number} iStandardLength - The standard length of the resulting string with leading zeros.
         * @returns {string} A string with leading zeros based on the input number and standard length.
         */
        fnGenerateLeadingZerosNumber: function (sInputNumber, iStandardLength) {
            // Calculate the number of leading zeros required
            const iNumberOfZeros = iStandardLength - sInputNumber.length;

            // Generate leading zeros
            const sLeadingZeros = '0'.repeat(Math.max(0, iNumberOfZeros));

            // Concatenate leading zeros with the input number
            return sLeadingZeros + sInputNumber;
        },
        /**
        * @param {String} num: String or Numner
        * @param {*} size:  Number size
        * @returns formated DateTime
        */
        fnPadNumber: function (num, size) {
            num = num.toString();
            while (num.length < size) num = "0" + num;
            return num;
        },

        /**
        * 
        * @param {*} sDateRaw: String of datetime
        * @returns formated DateTime
        */
        fnDisplayUTCDate: function (sDateRaw) {
            if (!sDateRaw) return "";
            try {
                const inputDate = new Date(sDateRaw);

                // Extract date components
                const year = inputDate.getUTCFullYear();
                const month = inputDate.getUTCMonth() + 1; // Months are zero-based, so add 1
                const day = inputDate.getUTCDate();

                // Pad single-digit day and month with leading zeros
                const formattedMonth = month.toString().padStart(2, '0');
                const formattedDay = day.toString().padStart(2, '0');

                // Format the date string
                const formattedDateString = `${formattedMonth}/${formattedDay}/${year}`;

                return formattedDateString;
            } catch (error) {
                //@ts-ignore
                console.error("UICommon - fnDisplayDate - error: ", error);
                return "Parse Date Failed";
            }

        },
        /**
         * Check value is number or not
         * @param sValue - value to check
         * @returns true or false
         * */
        fnIsNumber: function (sValue) {
            let bIsNumber = true;
            if (isNaN(sValue) || this.fnIsEmpty(sValue)) {
                bIsNumber = false;
            }
            return bIsNumber;
        },
        /**
         * Check value is empty or not
         * @param sValue - value to check
         * @return true or false
         * */
        fnIsEmpty: function (sValue) {
            let bIsEmpty = false;
            if (sValue === null || sValue === "" || sValue === undefined) {
                bIsEmpty = true;
            }
            return bIsEmpty;
        },
        fnIsValidPredicGoal: function (value) {
            try {
                if (!this.fnIsNumber(value)) {
                    return false;
                }
                console.log(`fnIsValidPredicGoal: ${value}`);
                const iGoal = parseInt(value)
                if (iGoal < 0) {
                    return false;
                }
                return true;
                // const integerType = new sap.ui.model.type.Integer({
                //     constraints: {
                //       minimum: 0
                //     }
                //   });
                // return integerType.validateValue(value.toString());
            } catch (error) {
                console.log(`fnIsValidPredicGoal - Error:${error}`);
                return false;
            }
        },
        fnGetIsoDateStringWithoutMilliseconds: function (currDateString) {
            let date = new Date(currDateString);
            // Convert the Date object back to ISO string without milliseconds
            const isoStringWithoutMilliseconds = date.toISOString().split('.')[0] + 'Z';

            return isoStringWithoutMilliseconds;
        }
        //EOF
    };
});
