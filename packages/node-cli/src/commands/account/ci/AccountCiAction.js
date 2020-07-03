/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const { saveToken } = require('../../../utils/AuthenticationUtils');
const { PROD_ENVIRONMENT_ADDRESS } = require('../../../ApplicationConstants');
const CommandOptionsValidator = require('../../../core/CommandOptionsValidator');
const ValidationErrorsFormatter = require('../../../utils/ValidationErrorsFormatter');
const NodeTranslationService = require('../../../services/NodeTranslationService');

const { COMMAND_ACCOUNTCI } = require('../../../services/TranslationKeys');

const CLIException = require('../../../CLIException');

const COMMAND = {
	OPTIONS: {
		URL: 'url',
		DEV: 'dev',
	},
	FLAGS: {
		SAVETOKEN: 'savetoken',
	},
	SDK_COMMAND: 'authenticate',
	VALIDATION: {
		SAVE_TOKEN: {
			MANDATORY_OPTIONS: {
				savetoken: {
					name: 'savetoken',
					mandatory: true,
				},
				authid: {
					name: 'authid',
					mandatory: true,
				},
				tokenid: {
					name: 'tokenid',
					mandatory: true,
				},
				tokensecret: {
					name: 'tokensecret',
					mandatory: true,
				},
				accountid: {
					name: 'accountid',
					mandatory: true,
				},
			},
		},
	},
};

module.exports = class AccountCiAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute(params) {
		if (params[COMMAND.FLAGS.SAVETOKEN]) {
			const commandOptionsValidator = new CommandOptionsValidator();
			const validationErrors = commandOptionsValidator.validate({
				commandOptions: COMMAND.VALIDATION.SAVE_TOKEN.MANDATORY_OPTIONS,
				arguments: params,
			});
			if (validationErrors.length > 0) {
				throw new CLIException(-10, ValidationErrorsFormatter.formatErrors(validationErrors));
			}
			if (params[COMMAND.OPTIONS.URL]) {
				params[COMMAND.OPTIONS.DEV] = params[COMMAND.OPTIONS.URL] !== PROD_ENVIRONMENT_ADDRESS;
			}
			return await saveToken(params, this._sdkPath), this._projectFolder;
		} else {
			throw new CLIException(-10, COMMAND_ACCOUNTCI.SAVETOKEN_MANDATORY);
		}
	}
};
