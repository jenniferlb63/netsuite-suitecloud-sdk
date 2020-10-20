/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const CommandsMetadataService = require('../../../core/CommandsMetadataService');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const BaseAction = require('../../base/BaseAction');
const {
	COMMAND_IMPORTOBJECTS: { MESSAGES, WARNINGS },
} = require('../../../services/TranslationKeys');
const SdkExecutor = require('../../../SdkExecutor');

const ANSWERS_NAMES = {
	AUTH_ID: 'authid',
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

const LIST_OBJECTS_COMMAND_NAME = 'object:list';
const IMPORT_OBJECTS_COMMAND_TYPE_PARAM_ALL = 'ALL';
const IMPORT_OBJECTS_COMMAND_SCRIPT_ID_PARAM_ALL = 'ALL';
const NUMBER_OF_SCRIPTS = 35;
const MAX_PARALLEL_EXECUTIONS = 5;

module.exports = class ImportObjectsAction extends BaseAction {
	constructor(options) {
		super(options);

		const commandsMetadataService = new CommandsMetadataService();
		this._listObjectsMetadata = commandsMetadataService.getCommandMetadataByName(LIST_OBJECTS_COMMAND_NAME);
	}

	preExecute(answers) {
		answers[ANSWERS_NAMES.PROJECT_FOLDER] = CommandUtils.quoteString(this._projectFolder);
		answers[ANSWERS_NAMES.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);

		return answers;
	}

	async execute(params) {
		if (params[ANSWERS_NAMES.OVERWRITE_OBJECTS] === false) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL_IMPORT);
		}

		try {
			const flags = [];
			let scriptIdArray;
			if (this._runInInteractiveMode) {
				if (params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS] !== undefined && !params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS]) {
					flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
					delete params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS];
				}

				scriptIdArray = params[ANSWERS_NAMES.SCRIPT_ID].split(' ');
			} else {
				this._log.info(NodeTranslationService.getMessage(WARNINGS.OVERRIDE));
				if (params[COMMAND_FLAGS.EXCLUDE_FILES]) {
					flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
					delete params[COMMAND_FLAGS.EXCLUDE_FILES];
				}

				if (params[ANSWERS_NAMES.OBJECT_TYPE] === IMPORT_OBJECTS_COMMAND_TYPE_PARAM_ALL) {
					scriptIdArray = (await this._getAllScriptIds(params)).map((el) => el.scriptId).join(' ').split(' ');
				} if (params[ANSWERS_NAMES.OBJECT_TYPE] !== IMPORT_OBJECTS_COMMAND_TYPE_PARAM_ALL
					&& params[ANSWERS_NAMES.SCRIPT_ID] === IMPORT_OBJECTS_COMMAND_SCRIPT_ID_PARAM_ALL) {
					scriptIdArray = (await this._getAllScriptIdsForObjectType(params)).map((el) => el.scriptId).join(' ').split(' ');
				}
			}

			delete params[ANSWERS_NAMES.SCRIPT_ID];
			const operationResultData = {
				failedImports: [],
				successfulImports: [],
				errorImports: [],
			};
			const arrayOfPromises = [];
			const numberOfSdkCalls = Math.ceil(scriptIdArray.length / NUMBER_OF_SCRIPTS);
			const numberOfSteps = Math.ceil(numberOfSdkCalls / MAX_PARALLEL_EXECUTIONS);

			for (let i = 0; i < numberOfSdkCalls; i++) {
				const partialScriptIds = scriptIdArray.slice(i * NUMBER_OF_SCRIPTS, (i + 1) * NUMBER_OF_SCRIPTS);
				const partialScriptIdsString = partialScriptIds.join(' ');
				const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
				const partialExecutionContextForImportObjects = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
					.integration()
					.addFlags(flags)
					.addParams(sdkParams)
					.addParam(ANSWERS_NAMES.SCRIPT_ID, partialScriptIdsString)
					.build();

				const sdkExecutor = new SdkExecutor(this._sdkPath);
				arrayOfPromises.push(
					sdkExecutor
						.execute(partialExecutionContextForImportObjects)
						.then(this._parsePartialResult.bind({ partialScriptIds, operationResultData }))
				);
				if (i % MAX_PARALLEL_EXECUTIONS === (MAX_PARALLEL_EXECUTIONS - 1)) {
					await executeWithSpinner({
						action: Promise.all(arrayOfPromises),
						message: NodeTranslationService.getMessage(MESSAGES.IMPORTING_OBJECTS, (i + 1) / MAX_PARALLEL_EXECUTIONS, numberOfSteps),
					});
				}
			}

			await executeWithSpinner({
				action: Promise.all(arrayOfPromises),
				message: NodeTranslationService.getMessage(MESSAGES.IMPORTING_OBJECTS, numberOfSteps, numberOfSteps),
			});
			// At this point, the OperationResult will never be an error. It's handled before
			return ActionResult.Builder.withData(operationResultData).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	_parsePartialResult(partialOperationResult) {
		if (partialOperationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			this.operationResultData.errorImports = this.operationResultData.errorImports.concat({
				scriptIds: this.partialScriptIds,
				reason: partialOperationResult.errorMessages[0],
			});
		} else {
			if (partialOperationResult.data.failedImports.length > 0) {
				this.operationResultData.failedImports = this.operationResultData.failedImports.concat(
					partialOperationResult.data.failedImports
				);
			}
			if (partialOperationResult.data.successfulImports.length > 0) {
				this.operationResultData.successfulImports = this.operationResultData.successfulImports.concat(
					partialOperationResult.data.successfulImports
				);
			}
		}
	}

	async _getAllScriptIdsForObjectType(params) {
		const sdkParams = {};
		sdkParams.type = params[ANSWERS_NAMES.OBJECT_TYPE];

		return this._callListObjects(params, sdkParams);
	}

	async _getAllScriptIds(params) {
		return this._callListObjects(params, {});
	}

	async _callListObjects(params, sdkParams) {
		sdkParams.authid = params[ANSWERS_NAMES.AUTH_ID];

		const executionContext = SdkExecutionContext.Builder.forCommand(this._listObjectsMetadata.sdkCommand)
			.integration()
			.addParams(sdkParams)
			.build();

		const actionListObjects = this._sdkExecutor.execute(executionContext);

		const listObjectsOperationResult = await executeWithSpinner({
			action: actionListObjects,
			message: NodeTranslationService.getMessage(MESSAGES.LOADING_OBJECTS),
		});

		if (listObjectsOperationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listObjectsOperationResult.errorMessages;
		}

		return listObjectsOperationResult.data;
	}

};
