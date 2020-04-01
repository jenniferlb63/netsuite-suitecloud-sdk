/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');
const { COLORS } = require('../../loggers/LoggerConstants');

const ActionResultUtils = require('../../utils/ActionResultUtils');
const {
	COMMAND_CREATEPROJECT: { MESSAGES },
} = require('../../services/TranslationKeys');

class CreateProjectOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		if (!actionResult) {
			return;
		}
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}
		ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);

		const projectCreatedMessage = NodeTranslationService.getMessage(MESSAGES.PROJECT_CREATED, actionResult.projectName);
		this.consoleLogger.println(projectCreatedMessage, COLORS.RESULT);

		if (actionResult.includeUnitTesting) {
			const sampleUnitTestMessage = NodeTranslationService.getMessage(MESSAGES.SAMPLE_UNIT_TEST_ADDED);
			this.consoleLogger.println(sampleUnitTestMessage, COLORS.RESULT);
			if (!actionResult.npmPackageIntitialized) {
				this.consoleLogger.println(NodeTranslationService.getMessage(MESSAGES.INIT_NPM_DEPENDENCIES_FAILED), COLORS.ERROR);
			}
		}

		const navigateToProjectMessage = NodeTranslationService.getMessage(MESSAGES.NAVIGATE_TO_FOLDER, actionResult.projectDirectory);
		this.consoleLogger.println(navigateToProjectMessage, COLORS.RESULT);
	}
}

module.exports = CreateProjectOutputFormatter;
