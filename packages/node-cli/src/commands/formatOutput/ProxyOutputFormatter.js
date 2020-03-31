/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');
const {
	COMMAND_PROXY: { MESSAGES },
} = require('../../services/TranslationKeys');

class ProxyOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatOutput(actionResult) {
		if (actionResult.withSettingProxy) {
			if (actionResult.proxyOverridden) {
				this.consoleLogger.println(
					TranslationService.getMessage(MESSAGES.PROXY_OVERRIDDEN, actionResult.proxyUrl),
					this.consoleLogger.COLORS.RESULT
				);
			} else {
				this.consoleLogger.println(
					TranslationService.getMessage(MESSAGES.SUCCESFULLY_SETUP, actionResult.proxyUrl),
					this.consoleLogger.COLORS.RESULT
				);
			}
		} else {
			this.consoleLogger.println(TranslationService.getMessage(MESSAGES.SUCCESFULLY_CLEARED), this.consoleLogger.COLORS.RESULT);
		}
	}
}

module.exports = ProxyOutputFormatter;
