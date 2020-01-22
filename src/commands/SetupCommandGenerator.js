/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const chalk = require('chalk');
const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const AuthenticationService = require('./../core/authentication/AuthenticationService');
const OperationResultStatus = require('./OperationResultStatus');

const inquirer = require('inquirer');

const {
	FILE_NAMES: { MANIFEST_XML },
} = require('../ApplicationConstants');

const {
	COMMAND_SETUPACCOUNT: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES, OUTPUT },
} = require('../services/TranslationKeys');

const ANSWERS = {
	DEVELOPMENT_MODE_URL: 'developmentModeUrl',
	SELECTED_AUTH_ID: 'selected_auth_id',
	AUTH_MODE: 'AUTH_MODE',
	NEW_AUTH_ID: 'NEW_AUTH_ID',
	SAVE_TOKEN_ACCOUNT_ID: 'accountId',
	SAVE_TOKEN_ID: 'saveTokenId',
	SAVE_TOKEN_SECRET: 'saveTokenSecret',
};

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	SAVE_TOKEN: 'SAVE_TOKEN',
	REUSE: 'REUSE',
};

const COMMANDS = {
	AUTHENTICATE: 'authenticate',
	MANAGEAUTH: 'manageauth',
};

const FLAGS = {
	LIST: 'list',
	SAVETOKEN: 'savetoken',
	DEVELOPMENTMODE: 'developmentmode'
};

const {
	validateDevUrl,
	validateFieldHasNoSpaces,
	validateFieldIsNotEmpty,
	validateNotProductionUrl,
	validateAuthIDNotInList,
	validateAlphanumericHyphenUnderscore,
	validateMaximunLength,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

const CREATE_NEW_AUTH = '******CREATE_NEW_AUTH*******!£$%&*';

module.exports = class SetupCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._authenticationService = new AuthenticationService(options.executionPath);
	}

	async _getCommandQuestions(prompt, commandArguments) {
		this._checkWorkingDirectoryContainsValidProject();

		const getAuthListContext = new SDKExecutionContext({
			command: COMMANDS.MANAGEAUTH,
			flags: [FLAGS.LIST],
		});

		const existingAuthIDsResponse = await executeWithSpinner({
			action: this._sdkExecutor.execute(getAuthListContext),
			message: TranslationService.getMessage(MESSAGES.GETTING_AVAILABLE_AUTHIDS),
		});

		if (SDKOperationResultUtils.hasErrors(existingAuthIDsResponse)) {
			throw SDKOperationResultUtils.getResultMessage(existingAuthIDsResponse);
		}

		let authIdAnswer;
		const choices = [];
		const auhtIDs = Object.keys(existingAuthIDsResponse.data);

		if (auhtIDs.length > 0) {
			choices.push({
				name: chalk.bold(TranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.NEW_AUTH_ID)),
				value: CREATE_NEW_AUTH,
			});
			choices.push(new inquirer.Separator());
			choices.push(new inquirer.Separator(TranslationService.getMessage(MESSAGES.SELECT_CONFIGURED_AUTHID)));

			auhtIDs.forEach(authID => {
				const authentication = existingAuthIDsResponse.data[authID];
				const isDevLabel = authentication.isDev
					? TranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUHT_ID_DEV_URL, authentication.urls.app)
					: '';
				const accountInfo = `${authentication.accountInfo.companyName}, ${authentication.accountInfo.roleName}`;
				choices.push({
					name: TranslationService.getMessage(
						QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUHT_ID,
						authID,
						accountInfo,
						isDevLabel
					),
					value: authID,
				});
			});
			choices.push(new inquirer.Separator());

			authIdAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS.SELECTED_AUTH_ID,
					message: TranslationService.getMessage(QUESTIONS.SELECT_AUTHID),
					choices: choices,
				},
			]);
		} else {
			// There was no previous authIDs
			authIdAnswer = {
				[ANSWERS.SELECTED_AUTH_ID]: CREATE_NEW_AUTH,
			};
		}

		const selectedAuthID = authIdAnswer[ANSWERS.SELECTED_AUTH_ID];

		// reusing an already set authID
		if (selectedAuthID !== CREATE_NEW_AUTH) {
			return {
				createNewAuthentication: false,
				existingAuthId: selectedAuthID,
				mode: AUTH_MODE.REUSE,
			};
		}

		// creating a new authID
		let developmentModeUrlAnswer;
		if (selectedAuthID === CREATE_NEW_AUTH) {
			const developmentMode = commandArguments && commandArguments.dev !== undefined && commandArguments.dev;

			if (developmentMode) {
				developmentModeUrlAnswer = await prompt([
					{
						type: CommandUtils.INQUIRER_TYPES.INPUT,
						name: ANSWERS.DEVELOPMENT_MODE_URL,
						message: TranslationService.getMessage(QUESTIONS.DEVELOPMENT_MODE_URL),
						filter: answer => answer.trim(),
						validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty, validateDevUrl, validateNotProductionUrl),
					},
				]);
			}
			const newAuthenticationAnswers = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS.AUTH_MODE,
					message: TranslationService.getMessage(QUESTIONS.AUTH_MODE),
					choices: [
						{
							name: TranslationService.getMessage(QUESTIONS_CHOICES.AUTH_MODE.OAUTH),
							value: AUTH_MODE.OAUTH,
						},
						{
							name: TranslationService.getMessage(QUESTIONS_CHOICES.AUTH_MODE.SAVE_TOKEN),
							value: AUTH_MODE.SAVE_TOKEN,
						},
					],
				},
				{
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: ANSWERS.NEW_AUTH_ID,
					message: TranslationService.getMessage(QUESTIONS.NEW_AUTH_ID),
					filter: answer => answer.trim(),
					validate: fieldValue =>
						showValidationResults(fieldValue, validateFieldIsNotEmpty, validateFieldHasNoSpaces, fieldValue =>
							validateAuthIDNotInList(fieldValue, auhtIDs), validateAlphanumericHyphenUnderscore, validateMaximunLength
						),
				},
				{
					when: response => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: ANSWERS.SAVE_TOKEN_ACCOUNT_ID,
					message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ACCOUNT_ID),
					filter: fieldValue => fieldValue.trim(),
					validate: fieldValue => showValidationResults(
						fieldValue,
						validateFieldIsNotEmpty,
						validateFieldHasNoSpaces,
						validateAlphanumericHyphenUnderscore
					),
				},
				{
					when: response => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
					type: CommandUtils.INQUIRER_TYPES.PASSWORD,
					mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
					name: ANSWERS.SAVE_TOKEN_ID,
					message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ID),
					filter: fieldValue => fieldValue.trim(),
					validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
				},
				{
					when: response => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
					type: CommandUtils.INQUIRER_TYPES.PASSWORD,
					mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
					name: ANSWERS.SAVE_TOKEN_SECRET,
					message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_SECRET),
					filter: fieldValue => fieldValue.trim(),
					validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
				},
			]);

			const executeActionContext = {
				developmentMode: developmentMode,
				createNewAuthentication: true,
				newAuthId: newAuthenticationAnswers[ANSWERS.NEW_AUTH_ID],
				mode: newAuthenticationAnswers[ANSWERS.AUTH_MODE],
				saveToken: {
					account: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_ACCOUNT_ID],
					tokenId: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_ID],
					tokenSecret: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_SECRET],
				}
			};

			if (developmentModeUrlAnswer) {
				executeActionContext.url = developmentModeUrlAnswer[ANSWERS.DEVELOPMENT_MODE_URL];
			}

			return executeActionContext;
		}
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw TranslationService.getMessage(ERRORS.NOT_PROJECT_FOLDER, MANIFEST_XML, this._projectFolder);
		}
	}

	async _executeAction(executeActionContext) {
		let authId;
		let accountInfo;
		if (executeActionContext.mode === AUTH_MODE.OAUTH) {
			const commandParams = {
				authId: executeActionContext.newAuthId,
			};

			if (executeActionContext.url) {
				commandParams.url = executeActionContext.url;
			}

			const operationResult = await this._performBrowserBasedAuthentication(commandParams, executeActionContext.developmentMode);
			authId = executeActionContext.newAuthId;
			accountInfo = operationResult.data.accountInfo;
		} else if (executeActionContext.mode === AUTH_MODE.SAVE_TOKEN) {
			const commandParams = {
				authid: executeActionContext.newAuthId,
				account: executeActionContext.saveToken.account,
				tokenid: executeActionContext.saveToken.tokenId,
				tokensecret: executeActionContext.saveToken.tokenSecret,
			};

			if (executeActionContext.url) {
				commandParams.url = executeActionContext.url;
			}

			await this._saveToken(commandParams, executeActionContext.developmentMode);
			authId = executeActionContext.newAuthId;
		} else if (executeActionContext.mode === AUTH_MODE.REUSE) {
			authId = executeActionContext.existingAuthId;
		}
		this._authenticationService.setDefaultAuthentication(authId);

		return {
			status: OperationResultStatus.SUCCESS,
			mode: executeActionContext.mode,
			authId: authId,
			accountInfo: accountInfo
		};
	}

	async _performBrowserBasedAuthentication(params, developmentMode) {
		const executionContextOptions = {
			command: COMMANDS.AUTHENTICATE,
			params,
		};

		if (developmentMode) {
			executionContextOptions.flags = [FLAGS.DEVELOPMENTMODE];
		}

		const authenticateSDKExecutionContext = new SDKExecutionContext(executionContextOptions);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(authenticateSDKExecutionContext),
			message: TranslationService.getMessage(MESSAGES.STARTING_OAUTH_FLOW),
		});
		this._checkOperationResultIsSuccessful(operationResult);

		return operationResult;
	}

	async _saveToken(params, developmentMode) {
		const executionContextOptions = {
			command: COMMANDS.AUTHENTICATE,
			params,
			flags: [FLAGS.SAVETOKEN]
		};

		if (developmentMode) {
			executionContextOptions.flags.push(FLAGS.DEVELOPMENTMODE);
		}

		const executionContext = new SDKExecutionContext(executionContextOptions);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(MESSAGES.SAVING_TBA_TOKEN),
		});
		this._checkOperationResultIsSuccessful(operationResult);
	}

	_formatOutput(operationResult) {
		let resultMessage;
		switch (operationResult.mode) {
			case AUTH_MODE.OAUTH:
				resultMessage = TranslationService.getMessage(
					OUTPUT.NEW_OAUTH,
					operationResult.accountInfo.companyName,
					operationResult.accountInfo.roleName,
					operationResult.authId
					);
				NodeUtils.println(JSON.stringify(operationResult));
				break;
			case AUTH_MODE.SAVE_TOKEN:
				resultMessage = TranslationService.getMessage(OUTPUT.NEW_SAVED_TOKEN, operationResult.authId);
				break;
			case AUTH_MODE.REUSE:
				resultMessage = TranslationService.getMessage(OUTPUT.REUSED_AUTH_ID, operationResult.authId);
				break;
			default:
				break;
		}

		NodeUtils.println(resultMessage, NodeUtils.COLORS.RESULT);
		NodeUtils.println(TranslationService.getMessage(OUTPUT.SUCCESSFUL), NodeUtils.COLORS.RESULT);
	}

	_checkOperationResultIsSuccessful(operationResult) {
		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			const errorMessage = SDKOperationResultUtils.getResultMessage(operationResult);
			if (errorMessage) {
				throw errorMessage;
			}
			throw SDKOperationResultUtils.getErrorMessagesString(operationResult);
		}
	}
};
