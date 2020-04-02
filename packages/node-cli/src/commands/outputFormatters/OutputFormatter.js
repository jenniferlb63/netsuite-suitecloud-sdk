/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { lineBreak } = require('../../loggers/LoggerConstants');
const { unwrapExceptionMessage, unwrapInformationMessage } = require('../../utils/ExceptionUtils');

class OutputFormatter {
	constructor(consoleLogger) {
		this._consoleLogger = consoleLogger;
	}

	get consoleLogger() {
		return this._consoleLogger;
	}

	formatActionResult(actionResult) {}

	formatError(error) {
		this.consoleLogger.error(unwrapExceptionMessage(error));
		const informativeMessage = unwrapInformationMessage(error);

		if (informativeMessage) {
			this.consoleLogger.info(`${lineBreak}${informativeMessage}`);
		}
	}
}

module.exports = OutputFormatter;
