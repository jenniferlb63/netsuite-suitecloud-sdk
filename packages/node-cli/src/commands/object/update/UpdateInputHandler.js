/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const path = require('path');
const { prompt, Separator } = require('inquirer');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const FileSystemService = require('../../../services/FileSystemService');
const BaseInputHandler = require('../../base/BaseInputHandler');

const {
	COMMAND_UPDATE: { ERRORS, QUESTIONS, MESSAGES },
	YES,
	NO,
} = require('../../../services/TranslationKeys');

const { validateArrayIsNotEmpty, validateScriptId, showValidationResults } = require('../../../validation/InteractiveAnswersValidator');

const { FOLDERS } = require('../../../ApplicationConstants');
const ANSWERS_NAMES = {
	FILTER_BY_SCRIPT_ID: 'filterByScriptId',
	INCLUDE_CUSTOM_INSTANCES: 'includeCustomInstances',
	OVERWRITE_OBJECTS: 'overwriteObjects',
	SCRIPT_ID_LIST: 'scriptid',
	SCRIPT_ID_FILTER: 'scriptIdFilter',
};

const COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	INCLUDE_CUSTOM_INSTANCES: 'includecustominstances',
	PROJECT: 'project',
	SCRIPT_ID: 'scriptid',
};

const MAX_ENTRIES_BEFORE_FILTER = 30;
const XML_EXTENSION = '.xml';

module.exports = class UpdateInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
	}

	async getParameters(_params) {
		const foundXMLFiles = this.searchFilesFromObjectsFolder();
		let filteredObjects = await this.getObjectsToSelect(foundXMLFiles);
		const selectedScriptIds = await this.selectObjectsScriptIds(foundXMLFiles, filteredObjects);
		const customRecordsAndSegments = selectedScriptIds.filter((scriptid) => scriptid.startsWith('customrecord') || scriptid.startsWith('cseg'));

		const includeCustomInstancesQuestions = {
			when: selectedScriptIds.length == 1 && customRecordsAndSegments.length == selectedScriptIds.length,
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.INCLUDE_CUSTOM_INSTANCES,
			message: NodeTranslationService.getMessage(QUESTIONS.INCLUDE_CUSTOM_INSTANCES),
			default: false,
			choices: [
				{ name: NodeTranslationService.getMessage(YES), value: true },
				{ name: NodeTranslationService.getMessage(NO), value: false },
			],
		};

		const overwriteObjectsQuestion = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.OVERWRITE_OBJECTS,
			message: NodeTranslationService.getMessage(QUESTIONS.OVERWRITE_OBJECTS),
			default: 0,
			choices: [
				{ name: NodeTranslationService.getMessage(YES), value: true },
				{ name: NodeTranslationService.getMessage(NO), value: false },
			],
		};
		const answers = await prompt([includeCustomInstancesQuestions, overwriteObjectsQuestion]);

		return {
			[ANSWERS_NAMES.OVERWRITE_OBJECTS]: answers[ANSWERS_NAMES.OVERWRITE_OBJECTS],
			[COMMAND_OPTIONS.SCRIPT_ID]: selectedScriptIds,
			[COMMAND_OPTIONS.INCLUDE_CUSTOM_INSTANCES]: answers[ANSWERS_NAMES.INCLUDE_CUSTOM_INSTANCES]
				? answers[ANSWERS_NAMES.INCLUDE_CUSTOM_INSTANCES]
				: false,
		};
	}

	searchFilesFromObjectsFolder() {
		const pathToObjectsFolder = path.join(this._projectFolder, FOLDERS.OBJECTS);
		const filesInObjectsFolder = this._fileSystemService.getFilesFromDirectory(pathToObjectsFolder);
		const foundXMLFiles = filesInObjectsFolder
			.filter((filename) => filename.endsWith(XML_EXTENSION))
			.map((file) => ({
				name: file.replace(this._projectFolder, '').slice(0, -XML_EXTENSION.length),
				value: path.basename(file, XML_EXTENSION),
			}));

		if (foundXMLFiles.length === 0) {
			throw NodeTranslationService.getMessage(ERRORS.NO_OBJECTS_IN_PROJECT);
		}
		return foundXMLFiles;
	}

	async getObjectsToSelect(foundXMLFiles) {
		let filteredObjects;

		if (foundXMLFiles.length > MAX_ENTRIES_BEFORE_FILTER) {
			filteredObjects = await this.filterObjectsByScriptId(filteredObjects, foundXMLFiles);
			if (filteredObjects.length === 0) {
				throw NodeTranslationService.getMessage(MESSAGES.NO_OBJECTS_WITH_SCRIPT_ID_FILTER);
			}
		} else {
			filteredObjects = foundXMLFiles;
		}
		filteredObjects.push(new Separator());

		return filteredObjects;
	}

	async selectObjectsScriptIds(foundXMLFiles, filteredObjects) {
		const selectObjectsToUpdateQuestion = {
			when: foundXMLFiles.length > 1,
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWERS_NAMES.SCRIPT_ID_LIST,
			message: NodeTranslationService.getMessage(QUESTIONS.SCRIPT_ID),
			default: 1,
			choices: filteredObjects,
			validate: (fieldValue) => showValidationResults(fieldValue, validateArrayIsNotEmpty),
		};
		const answers = await prompt([selectObjectsToUpdateQuestion]);

		return answers[ANSWERS_NAMES.SCRIPT_ID_LIST];
	}

	async filterObjectsByScriptId(filteredObjects, foundXMLFiles) {
		const filterAnswers = await this.questionFilterByScriptId();
		filteredObjects = filterAnswers[ANSWERS_NAMES.FILTER_BY_SCRIPT_ID]
			? foundXMLFiles.filter((element) => element.value.includes(filterAnswers[ANSWERS_NAMES.SCRIPT_ID_FILTER]))
			: foundXMLFiles;
		return filteredObjects;
	}

	async questionFilterByScriptId() {
		return await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.FILTER_BY_SCRIPT_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
				default: false,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			},
			{
				when: (response) => {
					return response[ANSWERS_NAMES.FILTER_BY_SCRIPT_ID];
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS_NAMES.SCRIPT_ID_FILTER,
				message: NodeTranslationService.getMessage(QUESTIONS.SCRIPT_ID_FILTER),
				validate: (fieldValue) => showValidationResults(fieldValue, validateScriptId),
			},
		]);
	}
};
