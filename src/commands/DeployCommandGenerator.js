/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const SDFProjectUtils = require('../utils/SDFProjectUtils');
const ValidateSDFProjectUtils = require('../utils/ValidateSDFProjectUtils');
const TranslationService = require('../services/TranslationService');
const { executeWithSpinner } = require('../ui/CliSpinner');
const NodeUtils = require('../utils/NodeUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const assert = require('assert');

const {
	LINKS,
	PROJECT_ACP,
	PROJECT_SUITEAPP,
} = require('../ApplicationConstants');

const {
	COMMAND_DEPLOY: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
	NO,
	YES,
} = require('../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		APPLY_CONTENT_PROTECTION: 'applycontentprotection',
		LOG: 'log',
		PROJECT: 'project',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
	},
};

const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};

module.exports = class DeployCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
		this._projectType = this._projectMetadataService.getProjectType(this._projectFolder);
	}

	async _getCommandQuestions(prompt) {
		const isSuiteAppProject = this._projectType === PROJECT_SUITEAPP;
		const isACProject = this._projectType === PROJECT_ACP;


		const answers = await prompt([
			{
				when: isSuiteAppProject && SDFProjectUtils.hasLockOrHideFiles(this._projectFolder),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION,
				message: TranslationService.getMessage(QUESTIONS.APPLY_CONTENT_PROTECTION),
				default: 1,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			},
			{
				when: isACProject,
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES,
				message: TranslationService.getMessage(QUESTIONS.ACCOUNT_SPECIFIC_VALUES),
				default: 1,
				choices: [
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.DISPLAY_WARNING
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
					},
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL_PROCESS
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR,
					},
				],
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.FLAGS.VALIDATE,
				message: TranslationService.getMessage(QUESTIONS.PERFORM_LOCAL_VALIDATION),
				default: 0,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			}
		]);

		if (isSuiteAppProject && !answers.hasOwnProperty(COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION)) {
			NodeUtils.println(
				TranslationService.getMessage(
					MESSAGES.NOT_ASKING_CONTENT_PROTECTION_REASON,
					LINKS.HOW_TO.CREATE_HIDDING_XML,
					LINKS.HOW_TO.CREATE_LOCKING_XML
				),
				NodeUtils.COLORS.INFO
			);
		}

		return answers;
	}

	_preExecuteAction(args) {
		args[COMMAND.OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);

		args = ValidateSDFProjectUtils.validateAndTransformAccountSpecificValuesArgument(args);
		args = ValidateSDFProjectUtils.validateAndTransformApplyContentProtectionArgument(args, this._projectType);
		return args;
	}

	async _executeAction(answers) {
		const SDKParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
		const flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING];
		if (SDKParams[COMMAND.FLAGS.VALIDATE]) {
			delete SDKParams[COMMAND.FLAGS.VALIDATE];
			flags.push(COMMAND.FLAGS.VALIDATE);
		}
		const executionContextForDeploy = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: SDKParams,
			flags,
		});

		const deployResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForDeploy),
			message: TranslationService.getMessage(MESSAGES.DEPLOYING),
		});

		return {
			deployResult,
			SDKParams,
		};
	}

	_formatOutput(actionResult) {
		assert(actionResult.deployResult);
		assert(actionResult.SDKParams);

		const { deployResult, SDKParams } = actionResult;

		if (SDKOperationResultUtils.hasErrors(deployResult)) {
			SDKOperationResultUtils.logResultMessage(deployResult);
			SDKOperationResultUtils.logErrors(deployResult);
		} else {
			SDFProjectUtils.showApplyContentProtectionOptionMessage(SDKParams, this._projectType, this._projectFolder)
			const { data } = deployResult;
			SDKOperationResultUtils.logResultMessage(deployResult);
			if (Array.isArray(data)) {
				data.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.RESULT));
			}
		}
	}
};
