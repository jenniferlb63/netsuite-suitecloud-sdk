/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseAction = require('../base/BaseAction');
const executeWithSpinner = require('../../ui/CliSpinner').executeWithSpinner;
const CommandUtils = require('../../utils/CommandUtils');
const SDKExecutionContext = require('../../SdkExecutionContext');
const TranslationService = require('../../services/TranslationService');
const {
	COMMAND_SDK_WRAPPER: { MESSAGES },
} = require('../../services/TranslationKeys');

const FLAG_OPTION_TYPE = 'FLAG';
const PROJECT_DIRECTORY_OPTION = 'projectdirectory';
const PROJECT_OPTION = 'project';

module.exports = class SdkWrapperAction extends BaseAction {
	constructor(options) {
		super(options);
    }
    
    _setProjectFolderOptionsIfPresent(args) {
		const projectOptions = [PROJECT_OPTION, PROJECT_DIRECTORY_OPTION];
		projectOptions.forEach(projectOption => {
			if (this._commandMetadata.options[projectOption]) {
				args[projectOption] = CommandUtils.quoteString(this._projectFolder);
			}
		});
	}

	preExecute(args) {
		this._setProjectFolderOptionsIfPresent(args);
		return args;
	}

	async execute(args) {
		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.sdkCommand,
			integrationMode: false,
		});

		for (const optionId in this._commandMetadata.options) {
			if (
				this._commandMetadata.options.hasOwnProperty(optionId) &&
				args.hasOwnProperty(optionId)
			) {
				if (this._commandMetadata.options[optionId].type === FLAG_OPTION_TYPE) {
					if (args[optionId]) {
						executionContext.addFlag(optionId);
					}
				} else {
					executionContext.addParam(optionId, args[optionId]);
				}
			}
		}
		return await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(
				MESSAGES.EXECUTING_COMMAND,
				this._commandMetadata.name
			),
		});
	}

	async execute(params) {
		return this.localServer.executeAction(params);
	}
};
