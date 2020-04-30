/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const { prompt } = require('inquirer');
const BaseInputHandler = require('../base/BaseInputHandler');
const NodeTranslationService = require('../../services/NodeTranslationService');
const CommandUtils = require('../../utils/CommandUtils');
const ProjectInfoService = require('../../services/ProjectInfoService');

const { PROJECT_ACP, PROJECT_SUITEAPP } = require('../../ApplicationConstants');

const {
	COMMAND_VALIDATE: { QUESTIONS, QUESTIONS_CHOICES },
	YES,
	NO,
} = require('../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	SERVER: 'server',
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_CONTENT_PROTECTION: 'applycontentprotection',
	PROJECT: 'project',
};

const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};

module.exports = class ValidateInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	async getParameters(params) {
		params[COMMAND_OPTIONS.PROJECT] = this._projectFolder;
		if (!this._runInInteractiveMode) {
			return params;
		}
		const answers = prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.SERVER,
				message: NodeTranslationService.getMessage(QUESTIONS.SERVER_SIDE),
				default: 0,
				choices: [
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_OR_LOCAL.ACCOUNT),
						value: true,
					},
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_OR_LOCAL.LOCAL),
						value: false,
					},
				],
			},
			{
				when: this._projectInfoService.getProjectType() === PROJECT_ACP,
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.ACCOUNT_SPECIFIC_VALUES,
				message: NodeTranslationService.getMessage(QUESTIONS.ACCOUNT_SPECIFIC_VALUES),
				default: 1,
				choices: [
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.WARNING),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
					},
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR,
					},
				],
			},
			{
				when: this._projectInfoService.getProjectType() === PROJECT_SUITEAPP && this._projectInfoService.hasLockAndHideFiles(),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION,
				message: NodeTranslationService.getMessage(QUESTIONS.APPLY_CONTENT_PROTECTION),
				default: 0,
				choices: [
					{
						name: NodeTranslationService.getMessage(NO),
						value: false,
					},
					{
						name: NodeTranslationService.getMessage(YES),
						value: true,
					},
				],
			},
		]);
		return { ...params, ...answers };
	}
};
