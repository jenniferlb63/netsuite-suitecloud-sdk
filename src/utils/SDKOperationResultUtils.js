'use strict';
const OperationResultStatus = require('../commands/OperationResultStatus');
const NodeUtils = require('./NodeUtils');

module.exports = {
	getErrorMessagesString: operationResult => {
		const { errorMessages } = operationResult;
		if (Array.isArray(errorMessages) && errorMessages.length > 0) {
			return errorMessages.join(NodeUtils.lineBreak);
		}
		return '';
	},
	getResultMessage: operationResult => {
		const { resultMessage } = operationResult;
		return resultMessage ? resultMessage : '';
	},
	hasErrors: operationResult => {
		return operationResult.status === OperationResultStatus.ERROR;
	},
	logErrors: operationResult => {
		const { errorMessages } = operationResult;
		if (Array.isArray(errorMessages) && errorMessages.length > 0) {
			errorMessages.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.ERROR));
		} 
	},
	logResultMessage: operationResult => {
		const { resultMessage } = operationResult;
		if (resultMessage) {
			if (operationResult.status === OperationResultStatus.ERROR) {
				NodeUtils.println(resultMessage, NodeUtils.COLORS.ERROR);
			} else {
				NodeUtils.println(resultMessage, NodeUtils.COLORS.RESULT);
			}
		}
	},
	getErrorCode: operationResult => {
		const { errorCode } = operationResult;
		return errorCode ? errorCode : '';
	},
	setResultMessage: (operationResult, message) => {
		return {
			...operationResult,
			resultMessage : message
		};
	},
};
