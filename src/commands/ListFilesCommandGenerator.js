'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeUtils = require('../utils/NodeUtils');
const OperationResultStatus = require('./OperationResultStatus');
const {
	COMMAND_LISTFILES: { LOADING_FOLDERS, LOADING_FILES, SELECT_FOLDER, RESTRICTED_FOLDER, ERROR },
	ERRORS
} = require('../services/TranslationKeys');

const LIST_FOLDERS_COMMAND = 'listfolders';
const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';

module.exports = class ListFilesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_getCommandQuestions(prompt) {
		return new Promise(resolve => {
			const executionContext = new SDKExecutionContext({
				command: LIST_FOLDERS_COMMAND,
				showOutput: false,
			});
			this._applyDefaultContextParams(executionContext);

			return executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: TranslationService.getMessage(LOADING_FOLDERS),
			})
			.then(operationResult => {
				resolve(
					prompt([
						{
							type: CommandUtils.INQUIRER_TYPES.LIST,
							name: this._commandMetadata.options.folder.name,
							message: TranslationService.getMessage(SELECT_FOLDER),
							default: SUITE_SCRIPTS_FOLDER,
							choices: this._getFileCabinetFolders(operationResult),
						},
					])
				);
			})
			// TODO : find right mecanism to treat the error
			.catch( error => {
				NodeUtils.println(TranslationService.getMessage(ERROR, this._commandMetadata.name, error), NodeUtils.COLORS.ERROR);
			})
		});
	}

	_getFileCabinetFolders(listFoldersResponse) {
		return listFoldersResponse.data.map(folder => {
			return {
				name: folder.path,
				value: folder.path,
				disabled: folder.isRestricted
					? TranslationService.getMessage(RESTRICTED_FOLDER)
					: '',
			};
		});
	}

	_executeAction(answers) {
		// quote folder path to preserve spaces
		answers.folder = `\"${answers.folder}\"`;
		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(LOADING_FILES),
		});
	}

	_formatOutput(operationResult) {
		const {status, messages, data} = operationResult;

		if (status == OperationResultStatus.ERROR) {
			if (messages instanceof Array && messages.length > 0 ) {
				messages.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.ERROR));
			} else {
				NodeUtils.println(
					TranslationService.getMessage(ERRORS.PROCESS_FAILED),
					NodeUtils.COLORS.ERROR
				);
			}
			return;
		}

		if (messages) {
			messages.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.RESULT));
		}
		
		if (data) {
			data.forEach(el => {
				NodeUtils.println(el, NodeUtils.COLORS.RESULT)
			});
		}
	}
};
