/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const BaseAction = require('../basecommand/BaseAction');
const DeployActionResult = require('../../services/actionresult/DeployActionResult');
const SDKExecutionContext = require('../../SDKExecutionContext');
const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');
const NodeTranslationService = require('../../services/NodeTranslationService');
const CommandUtils = require('../../utils/CommandUtils');
const ProjectInfoService = require('../../services/ProjectInfoService');
const AccountSpecificArgumentHandler = require('../../utils/AccountSpecificValuesArgumentHandler');
const ApplyContentProtectinoArgumentHandler = require('../../utils/ApplyContentProtectionArgumentHandler');
const { executeWithSpinner } = require('../../ui/CliSpinner');
const { SDK_TRUE } = require('../../ApplicationConstants');

const {
	COMMAND_VALIDATE: { MESSAGES },
} = require('../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	SERVER: 'server',
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_CONTENT_PROTECTION: 'applycontentprotection',
	PROJECT: 'project',
};

module.exports = class ValidateAction extends BaseAction {
	constructor(options) {
        super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._accountSpecificValuesArgumentHandler = new AccountSpecificArgumentHandler({
			projectInfoService: this._projectInfoService,
		});
		this._applyContentProtectionArgumentHandler = new ApplyContentProtectinoArgumentHandler({
			projectInfoService: this._projectInfoService,
			commandName: this._commandMetadata.sdkCommand,
		});
	}

	preExecute(params) {
		this._accountSpecificValuesArgumentHandler.validate(params);
		this._applyContentProtectionArgumentHandler.validate(params);

		return {
			...params,
			[COMMAND_OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
			...this._accountSpecificValuesArgumentHandler.transformArgument(params),
			...this._applyContentProtectionArgumentHandler.transformArgument(params),
		};
	}

	async execute(params) {
		try {
			const SDKParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

			let isServerValidation = false;
			const flags = [];

			if (params[COMMAND_OPTIONS.SERVER]) {
				flags.push(COMMAND_OPTIONS.SERVER);
				isServerValidation = true;
				delete SDKParams[COMMAND_OPTIONS.SERVER];
			}

			const executionContext = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				params: SDKParams,
				flags: flags,
				includeProjectDefaultAuthId: true,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.VALIDATING),
			});

			return operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? DeployActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.withServerValidation(isServerValidation)
						.withAppliedContentProtection(SDKParams[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION] === SDK_TRUE)
						.withProjectType(this._projectInfoService.getProjectType)
						.withProjectFolder(this._projectFolder)
						.build()
				: DeployActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return DeployActionResult.Builder.withErrors([error]).build();
		}
	}
};
