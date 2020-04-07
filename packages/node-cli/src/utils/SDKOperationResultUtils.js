/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { lineBreak } = require('../loggers/LoggerConstants');

module.exports = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',

	getErrorMessagesString: operationResult => {
		const errorMessages = this.collectErrorMessages(operationResult);
		return errorMessages.join(lineBreak);
	},

	getResultMessage: operationResult => {
		const { resultMessage } = operationResult;
		return resultMessage ? resultMessage : '';
	},

	hasErrors: operationResult => {
		return operationResult.status === this.ERROR;
	},

	logResultMessage: (operationResult, consoleLogger) => {
		const { resultMessage } = operationResult;
		if (resultMessage) {
			if (operationResult.status === this.ERROR) {
				consoleLogger.error(resultMessage);
			} else {
				consoleLogger.result(resultMessage);
			}
		}
	},

	getErrorCode: operationResult => {
		const { errorCode } = operationResult;
		return errorCode ? errorCode : '';
	},
	// TODO: fix operationResult in SDK to always return errors in errorMessage and never in resultMessage
	collectErrorMessages: operationResult => {
		const { errorMessages, resultMessage } = operationResult;
		if (Array.isArray(errorMessages)) {
			if (resultMessage) {
				errorMessages.unshift(resultMessage);
			}
			return errorMessages;
		} else {
			return [resultMessage];
		}
	},
};
