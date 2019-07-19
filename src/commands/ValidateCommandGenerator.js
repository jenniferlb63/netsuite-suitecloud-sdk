/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const TranslationService = require('../services/TranslationService');
const CommandUtils = require('../utils/CommandUtils');
const SDFProjectUtils = require('../utils/SDFProjectUtils');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const { executeWithSpinner } = require('../ui/CliSpinner');

const {
	COMMAND_VALIDATE: { MESSAGES, QUESTIONS, QUESTIONS_CHOICES, OUTPUT },
	YES,
	NO,
} = require('../services/TranslationKeys');

const COMMAND_OPTIONS = {
	SERVER: 'server',
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_CONTENT_PROTECTION: 'applycontentprotection',
};

const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};

const APPLY_CONTENT_PROTECTION_VALUES = {
	TRUE: 'T',
	FALSE: 'F',
};

module.exports = class ValidateCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
	}

	_getCommandQuestions(prompt) {
		return prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.SERVER,
				message: TranslationService.getMessage(QUESTIONS.SERVER_SIDE),
				default: 0,
				choices: [
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_OR_LOCAL.ACCOUNT
						),
						value: true,
					},
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_OR_LOCAL.LOCAL
						),
						value: false,
					},
				],
			},
			{
				when: SDFProjectUtils.isACProject(this._projectFolder),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.ACCOUNT_SPECIFIC_VALUES,
				message: TranslationService.getMessage(QUESTIONS.ACCOUNT_SPECIFIC_VALUES),
				default: 1,
				choices: [
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.WARNING
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
					},
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR,
					},
				],
			},
			{
				when:
					SDFProjectUtils.isSuiteAppProject(this._projectFolder) &&
					SDFProjectUtils.hasLockOrHideFiles(this._projectFolder),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION,
				message: TranslationService.getMessage(QUESTIONS.APPLY_CONTENT_PROTECTION),
				default: 0,
				choices: [
					{
						name: TranslationService.getMessage(NO),
						value: false,
					},
					{
						name: TranslationService.getMessage(YES),
						value: true,
					},
				],
			},
		]);
	}

	_preExecuteAction(answers) {
		return SDFProjectUtils.validateAndDeployPreExecuteAction(answers, this._projectFolder);
	}

	async _executeAction(answers) {
		const SDKParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);

		let isServerValidation = false;
		const flags = [];

		if (answers[COMMAND_OPTIONS.SERVER]) {
			flags.push(COMMAND_OPTIONS.SERVER);
			isServerValidation = true;
		}
		delete answers[COMMAND_OPTIONS.SERVER];

		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
			flags: flags,
		});

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(MESSAGES.VALIDATING),
		});

		return { operationResult, SDKParams, isServerValidation };
	}

	_formatOutput(actionResult) {
		const { operationResult, isServerValidation } = actionResult;
		const { data } = operationResult;

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logErrors(operationResult);
		} else if (isServerValidation && Array.isArray(data)) {
			data.forEach(resultLine => {
				NodeUtils.println(resultLine, NodeUtils.COLORS.RESULT);
			});
		} else if (!isServerValidation) {
			this._showLocalValidationResultData(data);
			this._showApplyContentProtectionOptionMessage(actionResult);
		}
		SDKOperationResultUtils.logResultMessage(operationResult);
	}

	_showApplyContentProtectionOptionMessage(actionResult) {
		const { SDKParams } = actionResult;

		if (SDFProjectUtils.isSuiteAppProject(this._projectFolder)) {
			if (
				SDKParams[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION] ===
				APPLY_CONTENT_PROTECTION_VALUES.TRUE
			) {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.APPLYING_CONTENT_PROTECTION,
						this._executionPath
					),
					NodeUtils.COLORS.INFO
				);
			} else {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.NOT_APPLYING_CONTENT_PROTECTION,
						this._executionPath
					),
					NodeUtils.COLORS.INFO
				);
			}
		}
	}

	_showLocalValidationResultData(data) {
		this._logValidationEntries(
			data.warnings,
			TranslationService.getMessage(OUTPUT.HEADING_LABEL_WARNING),
			NodeUtils.COLORS.WARNING
		);
		this._logValidationEntries(
			data.errors,
			TranslationService.getMessage(OUTPUT.HEADING_LABEL_ERROR),
			NodeUtils.COLORS.ERROR
		);
	}

	_logValidationEntries(entries, headingLabel, color) {
		const files = [];
		entries.forEach(entry => {
			if (!files.includes(entry.filePath)) {
				files.push(entry.filePath);
			}
		});

		if (entries.length > 0) {
			NodeUtils.println(`${headingLabel}:`, color);
		}

		files.forEach(file => {
			const fileString = `    ${file}`;
			NodeUtils.println(fileString, color);
			entries
				.filter(entry => entry.filePath === file)
				.forEach(entry => {
					NodeUtils.println(
						TranslationService.getMessage(
							OUTPUT.VALIDATION_OUTPUT_MESSAGE,
							entry.lineNumber,
							entry.message
						),
						color
					);
				});
		});
	}
};
