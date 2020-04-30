/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../services/actionresult/ActionResult');
const CommandUtils = require('../../utils/CommandUtils');
const NodeTranslationService = require('../../services/NodeTranslationService');
const executeWithSpinner = require('../../ui/CliSpinner').executeWithSpinner;
const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');
const SDKExecutionContext = require('../../SDKExecutionContext');
const BaseAction = require('../basecommand/BaseAction');
const {	COMMAND_IMPORTOBJECTS: { MESSAGES }} = require('../../services/TranslationKeys');

const ANSWERS_NAMES = {
	APP_ID: 'appid',
	SCRIPT_ID: 'scriptid',
	SPECIFY_SCRIPT_ID: 'specifyscriptid',
	SPECIFY_SUITEAPP: 'specifysuiteapp',
	OBJECT_TYPE: 'type',
	SPECIFY_OBJECT_TYPE: 'specifyObjectType',
	TYPE_CHOICES_ARRAY: 'typeChoicesArray',
	DESTINATION_FOLDER: 'destinationfolder',
	PROJECT_FOLDER: 'project',
	OBJECTS_SELECTED: 'objects_selected',
	OVERWRITE_OBJECTS: 'overwrite_objects',
	IMPORT_REFERENCED_SUITESCRIPTS: 'import_referenced_suitescripts',
};

const COMMAND_FLAGS = {
	EXCLUDE_FILES: 'excludefiles',
};

module.exports = class ImportObjectsAction extends BaseAction {
	constructor(options) {
        super(options);
	}

	preExecute(parms) {
		parms[ANSWERS_NAMES.PROJECT_FOLDER] = CommandUtils.quoteString(this._projectFolder);

		return parms;
	}

	async execute(params) {
		if (params[ANSWERS_NAMES.OVERWRITE_OBJECTS] === false) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL_IMPORT);
		}

		try {
			const flags = [];
			if (this._runInInteractiveMode) {
				if (params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS] !== undefined && !params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS]) {
					flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
					delete params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS];
				}
			} else {
				if (params[COMMAND_FLAGS.EXCLUDE_FILES]) {
					flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
					delete params[COMMAND_FLAGS.EXCLUDE_FILES];
				}
			}

			const params = CommandUtils.extractCommandOptions(params, this._commandMetadata);
			const executionContextForImportObjects = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				params,
				flags,
				includeProjectDefaultAuthId: true,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForImportObjects),
				message: NodeTranslationService.getMessage(MESSAGES.IMPORTING_OBJECTS),
			});

			return operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data).withResultMessage(operationResult.resultMessage).build()
				: ActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
