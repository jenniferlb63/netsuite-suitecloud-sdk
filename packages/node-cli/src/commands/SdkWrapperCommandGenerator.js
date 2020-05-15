/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const CommandUtils = require('../utils/CommandUtils');
const SdkExecutionContext = require('../SdkExecutionContext');
const NodeTranslationService = require('../services/NodeTranslationService');
const {
	COMMAND_SDK_WRAPPER: { MESSAGES },
} = require('../services/TranslationKeys');

const FLAG_OPTION_TYPE = 'FLAG';
const PROJECT_DIRECTORY_OPTION = 'projectdirectory';
const PROJECT_OPTION = 'project';

module.exports = class SdkWrapperCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_supportsInteractiveMode() {
		return false;
	}

	_setProjectFolderOptionsIfPresent(args) {
		const projectOptions = [PROJECT_OPTION, PROJECT_DIRECTORY_OPTION];
		projectOptions.forEach(projectOption => {
			if (this._commandMetadata.options[projectOption]) {
				args[projectOption] = CommandUtils.quoteString(this._projectFolder);
			}
		});
	}

	_preExecuteAction(args) {
		this._setProjectFolderOptionsIfPresent(args);
		return args;
	}

	_executeAction(args) {
		let contextBuilder = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand);

		for (const optionId in this._commandMetadata.options) {
			if (
				this._commandMetadata.options.hasOwnProperty(optionId) &&
				args.hasOwnProperty(optionId)
			) {
				if (this._commandMetadata.options[optionId].type === FLAG_OPTION_TYPE) {
					if (args[optionId]) {
						contextBuilder.addFlag(optionId);
					}
				} else {
					contextBuilder.addParam(optionId, args[optionId]);
				}
			}
		}
		return executeWithSpinner({
			action: this._sdkExecutor.execute(contextBuilder.build()),
			message: NodeTranslationService.getMessage(
				MESSAGES.EXECUTING_COMMAND,
				this._commandMetadata.name
			),
		});
	}
};
