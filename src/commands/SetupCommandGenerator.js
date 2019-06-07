'use strict';

const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const Context = require('../Context');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const AccountService = require('../services/AccountService');
const inquirer = require('inquirer');

const ISSUE_TOKEN_COMMAND = 'issuetoken';
const SAVE_TOKEN_COMMAND = 'savetoken';

const { ACCOUNT_DETAILS_FILENAME, LINKS, MANIFEST_XML } = require('../ApplicationConstants');

const {
	COMMAND_SETUP: { ERRORS, QUESTIONS, MESSAGES, OUTPUT },
	NO,
	YES,
} = require('../services/TranslationKeys');

const ANSWERS = {
	OVERWRITE: 'overwrite',
	USE_PRODUCTION_ACCOUNT: 'useProductionAccount',
	DOMAIN_URL: 'domainUrl',
	EMAIL: 'email',
	PASSWORD: 'password',
	COMPANY_ID: 'companyId',
	ROLE_ID: 'roleId',
	ISSUE_A_TOKEN: 'issueAToken',
	SAVE_TOKEN_ID: 'saveTokenId',
	SAVE_TOKEN_SECRET: 'saveTokenSecret',
	TWO_FACTOR_AUTH: 'twoFactorAuth',
};

const {
	validateFieldIsNotEmpty,
	validateEmail,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

module.exports = class SetupCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	async _getCommandQuestions(prompt) {
		this._checkWorkingDirectoryContainsValidProject();

		if (this._accountDetailsFileExists()) {
			const overwriteAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS.OVERWRITE,
					message: TranslationService.getMessage(
						QUESTIONS.OVERWRITE_ACCOUNT_DETAILS_FILE,
						ACCOUNT_DETAILS_FILENAME
					),
					default: 0,
					choices: [
						{ name: TranslationService.getMessage(YES), value: true },
						{ name: TranslationService.getMessage(NO), value: false },
					],
				},
			]);
			if (!overwriteAnswer[ANSWERS.OVERWRITE]) {
				throw TranslationService.getMessage(MESSAGES.CANCEL_SETUP);
			}
		}

		const credentialsAnswers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.EMAIL,
				message: TranslationService.getMessage(QUESTIONS.EMAIL),
				filter: ansewer => ansewer.trim(),
				validate: fieldValue =>
					showValidationResults(fieldValue, validateFieldIsNotEmpty, validateEmail),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.PASSWORD,
				name: ANSWERS.PASSWORD,
				message: TranslationService.getMessage(QUESTIONS.PASSWORD),
				filter: ansewer => ansewer.trim(),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
		]);

		let response;
		try {
			response = await AccountService.getAccountAndRoles(credentialsAnswers);
		} catch (err) {
			if (err.statusCode) {
				throw JSON.parse(err.error).error.message;
			} else {
				throw err.message;
			}
		}

		const accountAndRoles = JSON.parse(response);

		// compact all the previous info grouped by accountId's
		const accountsInfo = accountAndRoles.reduce((accumulator, current) => {
			const { account, role, dataCenterURLs } = current;
			if (!accumulator[account.internalId]) {
				accumulator[account.internalId] = {
					...account,
					roles: [role],
					dataCenterURLs,
				};
			} else {
				accumulator[account.internalId].roles.push(role);
			}
			return accumulator;
		}, {});

		const companiesChoices = Object.values(accountsInfo).map(company => ({
			name: `${company.name} - [roles: ${company.roles.map(role => role.name).join(', ')}]`,
			value: company.internalId,
		}));

		const accountAndRoleAnswers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS.COMPANY_ID,
				message: TranslationService.getMessage(QUESTIONS.COMPANY_ID),
				choices: [...companiesChoices, new inquirer.Separator()],
			},
			{
				when: response => accountsInfo[response[ANSWERS.COMPANY_ID]].roles.length > 1,
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS.ROLE_ID,
				message: TranslationService.getMessage(QUESTIONS.ROLE),
				choices: response => [
					...accountsInfo[response[ANSWERS.COMPANY_ID]].roles.map(role => ({
						name: role.name,
						value: role.internalId,
					})),
				],
			},
		]);

		const selectedCompId = accountAndRoleAnswers[ANSWERS.COMPANY_ID];
		const selectedRoleId = accountAndRoleAnswers[ANSWERS.ROLE_ID];

		if (!(accountsInfo[selectedCompId].roles.length > 1)) {
			accountAndRoleAnswers[ANSWERS.ROLE_ID] =
				accountsInfo[selectedCompId].roles[0].internalId;
		}

		const issueOrSaveTokenAnswers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS.ISSUE_A_TOKEN,
				message: TranslationService.getMessage(
					QUESTIONS.ISSUE_A_TOKEN,
					LINKS.HOW_TO.ISSUE_A_TOKEN
				),
				choices: [
					{
						name: TranslationService.getMessage(QUESTIONS.ISSUE_TOKEN_OPTION),
						value: true,
					},
					{
						name: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_OPTION),
						value: false,
					},
				],
			},
			{
				when: response => !response[ANSWERS.ISSUE_A_TOKEN],
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.SAVE_TOKEN_ID,
				message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ID),
				filter: fieldValue => fieldValue.trim(),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
			{
				when: response => !response[ANSWERS.ISSUE_A_TOKEN],
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.SAVE_TOKEN_SECRET,
				message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_SECRET),
				filter: fieldValue => fieldValue.trim(),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
		]);

		return {
			email: credentialsAnswers[ANSWERS.EMAIL],
			password: credentialsAnswers[ANSWERS.PASSWORD],
			account: selectedCompId,
			accountName: accountsInfo[selectedCompId].name,
			environment: accountsInfo[selectedCompId].dataCenterURLs.systemDomain.split('//')[1],
			role: selectedRoleId,
			roleName: accountsInfo[selectedCompId].roles.find(role => role.internalId === selectedRoleId).name,
			...issueOrSaveTokenAnswers,
		};
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw TranslationService.getMessage(
				ERRORS.NOT_PROJECT_FOLDER,
				MANIFEST_XML,
				this._projectFolder
			);
		}
	}

	_accountDetailsFileExists() {
		if (FileUtils.exists(path.join(process.cwd(), ACCOUNT_DETAILS_FILENAME))) {
			return true;
		}
		return false;
	}

	_issueToken() {
		let executionContext = new SDKExecutionContext({
			command: ISSUE_TOKEN_COMMAND,
			showOutput: false,
		});
		this._applyDefaultContextParams(executionContext);

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(MESSAGES.ISSUING_TBA_TOKEN),
		});
	}

	_saveToken(params) {
		let executionContext = new SDKExecutionContext({
			command: SAVE_TOKEN_COMMAND,
			showOutput: false,
			params,
		});
		this._applyDefaultContextParams(executionContext);

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(MESSAGES.SAVING_TBA_TOKEN),
		});
	}

	_createAccountDetailsFile(contextValues) {
		// delete the password before saving
		delete contextValues[ANSWERS.PASSWORD];
		// nest the values into a 'default' property
		const defaultAccountDetails = {
			default: contextValues,
		};
		FileUtils.create(ACCOUNT_DETAILS_FILENAME, defaultAccountDetails);
	}

	async _executeAction(answers) {
		const contextValues = {
			netsuiteUrl: answers.environment,
			compId: answers.account,
			compName: answers.accountName,
			roleId: answers.role,
			roleName: answers.roleName,
			email: answers.email,
			password: answers.password,
		};
		Context.CurrentAccountDetails.initializeFromObj(contextValues);

		let operationResult;

		if (answers[ANSWERS.ISSUE_A_TOKEN]) {
			operationResult = await this._issueToken();
		} else {
			const saveTokenParams = {
				tokenid: answers[ANSWERS.SAVE_TOKEN_ID],
				tokensecret: answers[ANSWERS.SAVE_TOKEN_SECRET],
			};
			operationResult = await this._saveToken(saveTokenParams);
		}

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			throw SDKOperationResultUtils.getMessagesString(operationResult);
		}

		try {
			this._createAccountDetailsFile(contextValues);
		} catch (error) {
			throw TranslationService.getMessage(ERRORS.WRITING_ACCOUNT_JSON);
		}

		return operationResult;
	}

	_formatOutput(operationResult) {
		SDKOperationResultUtils.logMessages(operationResult);
		NodeUtils.println(
			TranslationService.getMessage(OUTPUT.SUCCESSFUL),
			NodeUtils.COLORS.RESULT
		);
	}
};
