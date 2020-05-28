/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseInputHandler = require('../base/BaseInputHandler');
const CommandUtils = require('../../utils/CommandUtils');
const NodeTranslationService = require('../../services/NodeTranslationService');
const AuthenticationService = require('../../services/AuthenticationService');
const { prompt, Separator } = require('inquirer');
const {
	showValidationResults,
	validateAuthIDNotInList,
	validateAlphanumericHyphenUnderscore,
	validateFieldHasNoSpaces,
	validateFieldIsNotEmpty,
	validateMaximumLength,
	validateSameAuthID,
} = require('../../validation/InteractiveAnswersValidator');

const {
	COMMAND_MANAGE_ACCOUNT: { QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
	YES,
	NO,
} = require('../../services/TranslationKeys');

const ACTION = {
	NOTHING: 'nothing',
	RENAME: 'rename',
	REMOVE: 'remove',
	REVOKE: 'revoke',
};

const COMMAND = {
	OPTIONS: {
		INFO: 'info',
		LIST: 'list',
		REMOVE: 'remove',
		RENAME: 'rename',
		RENAMETO: 'renameto',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
	},
};

const ANSWERS_NAMES = {
	SELECTED_AUTH_ID: 'selected_auth_id',
	ACTION: 'action',
	AUTHID: 'authId',
	CONTINUE: 'continue',
	RENAMETO: 'renameto',
	REMOVE: 'remove',
};

module.exports = class ManageAccountInputHandler extends BaseInputHandler {
	constructor(options) {
        super(options);
        this._sdkPath = options.sdkPath;
	}

	async getParameters(params) {
		const authIDList = await AuthenticationService.getAuthIds(this._sdkPath);
		let answers = await this._selectAuthID(authIDList.data, prompt);
		this._logAccountInfo(answers[ANSWERS_NAMES.SELECTED_AUTH_ID]);
		const selectedAuthID = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
		answers[ANSWERS_NAMES.ACTION] = await this._selectAction(prompt);
		if (answers[ANSWERS_NAMES.ACTION] == ACTION.RENAME) {
			answers[ANSWERS_NAMES.RENAMETO] = await this._introduceNewName(prompt, authIDList.data, selectedAuthID);
		} else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REMOVE) {
			answers[ANSWERS_NAMES.REMOVE] = await this._confirmRemove(prompt);
		}

		return { ...params, ...this._extractAnswers(answers) };
	}

	_logAccountInfo(selectedAuthId) {
		const accountInfo = selectedAuthId.accountInfo;
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.AUTHID, selectedAuthId.authId));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_NAME, accountInfo.companyName));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_ID, accountInfo.companyId));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ROLE, accountInfo.roleName));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.DOMAIN, accountInfo.roleName));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_TYPE, accountInfo.roleName));
	}

	_accountCredentialToString(authID, accountCredential) {
		const isDevLabel = accountCredential.developmentMode
		   ? NodeTranslationService.getMessage(
				QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID_DEV_URL,
				accountCredential.urls.app
			 )
		   : "";
		const accountInfo = `${accountCredential.accountInfo.roleName} @ ${accountCredential.accountInfo.companyName}`;
		const accountCredentialString = NodeTranslationService.getMessage(
		   QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID,
		   authID,
		   accountInfo,
		   isDevLabel
		);
		return accountCredentialString;
	 }

	async _selectAuthID(authIDList, prompt) {
		var authIDs = Object.entries(authIDList).sort();
		if (authIDs.length <= 0) {
			throw NodeTranslationService.getMessage(ERRORS.CREDENTIALS_EMPTY);
		}
		const choices = [];
		authIDs.forEach((authIDArray) => {
			const authID = authIDArray[0];
			const accountCredential = authIDArray[1];
			const accountCredentialString = this._accountCredentialToString(authID, accountCredential);
			choices.push({
				name: accountCredentialString,
				value: { authId: authID, accountInfo: accountCredential.accountInfo, domain: accountCredential.urls.app },
			});
		});
		choices.push(new Separator());
		let answers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.SELECTED_AUTH_ID,
				message: NodeTranslationService.getMessage(MESSAGES.SELECT_CONFIGURED_AUTHID),
				choices: choices,
			},
		]);
		return answers;
	}

	async _selectAction(prompt) {
		let answer = await prompt({
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.ACTION,
			message: NodeTranslationService.getMessage(QUESTIONS.SELECT_ACTION),
			choices: [
				{
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.RENAME),
					value: ACTION.RENAME,
				},
				{
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.REMOVE),
					value: ACTION.REMOVE,
				},
				// {
				//    name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.REVOKE),
				//    value: ACTION.REVOKE,
				// },
				{
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.EXIT),
					value: ACTION.EXIT,
				},
			],
		});
	
		if (answer[ANSWERS_NAMES.ACTION] == ACTION.EXIT) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL);
		}
	
		return answer[ANSWERS_NAMES.ACTION];
	}

	async _introduceNewName(prompt, authIDList, originalAuthId) {
		let answer = await prompt({
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: ANSWERS_NAMES.RENAMETO,
			message: NodeTranslationService.getMessage(QUESTIONS.NEW_NAME),
			filter: (fieldValue) => fieldValue.trim(),
			validate: (fieldValue) =>
				showValidationResults(
					fieldValue,
					validateFieldIsNotEmpty,
					validateFieldHasNoSpaces,
					(fieldValue) => validateSameAuthID(fieldValue, originalAuthId),
					(fieldValue) => validateAuthIDNotInList(fieldValue, Object.keys(authIDList)),
					validateAlphanumericHyphenUnderscore,
					validateMaximumLength
				),
		});
		return answer[ANSWERS_NAMES.RENAMETO];
	}

	async _confirmRemove(prompt) {
		let answer = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.REMOVE,
				message: NodeTranslationService.getMessage(QUESTIONS.VERIFY_REMOVE),
				default: false,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			},
		]);
		if (!answer[ANSWERS_NAMES.REMOVE]) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL);
		}
		return answer[ANSWERS_NAMES.REMOVE];
	}

	_extractAnswers(answers) {
		if (answers[ANSWERS_NAMES.ACTION] == ACTION.RENAME) {
			return {
				[COMMAND.OPTIONS.RENAME]: answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId,
				[COMMAND.OPTIONS.RENAMETO]: answers[ANSWERS_NAMES.RENAMETO],
			};
		} else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REMOVE) {
			return {
				[COMMAND.OPTIONS.REMOVE]: answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId,
			};
			// } else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REVOKE) {
			//    return {
			//    [COMMAND.OPTIONS.REVOKE]: answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId,
			// }
		}
	}
};
