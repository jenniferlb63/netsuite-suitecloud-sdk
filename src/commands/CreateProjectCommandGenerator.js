'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const TemplateKeys = require('../templates/TemplateKeys');
const FileSystemService = require('../services/FileSystemService');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const ApplicationConstants = require('../ApplicationConstants');
const {
	COMMAND_CREATEPROJECT: { QUESTIONS, MESSAGES },
	YES,
	NO,
} = require('../services/TranslationKeys');

const path = require('path');

const ACP_PROJECT_TYPE_DISPLAY = 'Account Customization Project';
const SUITEAPP_PROJECT_TYPE_DISPLAY = 'SuiteApp';
const ACCOUNT_CUSTOMIZATION_DISPLAY = 'Account Customization';

const SOURCE_FOLDER = 'src';
const CLI_CONFIG_TEMPLATE_KEY = 'cliconfig';
const CLI_CONFIG_FILENAME = 'cli-config';
const CLI_CONFIG_EXTENSION = 'js';

const COMMAND_OPTIONS = {
	OVERWRITE: 'overwrite',
	PARENT_DIRECTORY: 'parentdirectory',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	TYPE: 'type',
};

const COMMAND_ANSWERS = {
	PROJECT_ABSOLUTE_PATH: 'projectabsolutepath',
	PROJECT_FOLDER_NAME: 'projectfoldername',
};

const {
	validateFieldIsNotEmpty,
	showValidationResults,
	validateFieldHasNoSpaces,
	validateFieldIsLowerCase,
	validatePublisherId,
	validateProjectVersion,
} = require('../validation/InteractiveAnswersValidator');

module.exports = class CreateProjectCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
	}

	async _getCommandQuestions(prompt) {
		const answers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.TYPE,
				message: TranslationService.getMessage(QUESTIONS.CHOOSE_PROJECT_TYPE),
				default: 0,
				choices: [
					{
						name: ACP_PROJECT_TYPE_DISPLAY,
						value: ApplicationConstants.PROJECT_ACP,
					},
					{
						name: SUITEAPP_PROJECT_TYPE_DISPLAY,
						value: ApplicationConstants.PROJECT_SUITEAPP,
					},
				],
			},
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_NAME,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_NAME),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
			{
				when: function(response) {
					return response[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PUBLISHER_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PUBLISHER_ID),
				validate: fieldValue => showValidationResults(fieldValue, validatePublisherId),
			},
			{
				when: function(response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_ID),
				validate: fieldValue =>
					showValidationResults(
						fieldValue,
						validateFieldIsNotEmpty,
						validateFieldHasNoSpaces,
						validateFieldIsLowerCase
					),
			},
			{
				when: function(response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_VERSION,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_VERSION),
				validate: fieldValue => showValidationResults(fieldValue, validateProjectVersion),
			},
		]);

		answers[COMMAND_OPTIONS.PARENT_DIRECTORY] = this._projectFolder;
		answers[COMMAND_ANSWERS.PROJECT_FOLDER_NAME] = this._getProjectFolderName(answers);
		answers[COMMAND_ANSWERS.PROJECT_ABSOLUTE_PATH] = path.join(this._projectFolder, answers[COMMAND_ANSWERS.PROJECT_FOLDER_NAME]);

		if (
			this._fileSystemService.folderExists(answers[COMMAND_ANSWERS.PROJECT_ABSOLUTE_PATH]) &&
			!this._fileSystemService.isFolderEmpty(answers[COMMAND_ANSWERS.PROJECT_ABSOLUTE_PATH])
		) {
			const overwriteAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: COMMAND_OPTIONS.OVERWRITE,
					message: TranslationService.getMessage(
						QUESTIONS.OVERWRITE_PROJECT,
						answers[COMMAND_ANSWERS.PROJECT_ABSOLUTE_PATH]
					),
					default: 0,
					choices: [
						{ name: TranslationService.getMessage(NO), value: false },
						{ name: TranslationService.getMessage(YES), value: true },
					],
				},
			]);
			answers[COMMAND_OPTIONS.OVERWRITE] = overwriteAnswer[COMMAND_OPTIONS.OVERWRITE];
			if (!overwriteAnswer[COMMAND_OPTIONS.OVERWRITE]) {
				throw TranslationService.getMessage(MESSAGES.PROJECT_CREATION_CANCELLED);
			}
		}
		return answers;
	}

	_getProjectFolderName(answers) {
		return answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP
			? answers[COMMAND_OPTIONS.PUBLISHER_ID] + '.' + answers[COMMAND_OPTIONS.PROJECT_ID]
			: answers[COMMAND_OPTIONS.PROJECT_NAME];
	}

	_getProjectAbsolutePath(answers) {
		return path.join(
			answers[COMMAND_OPTIONS.PARENT_DIRECTORY],
			answers[COMMAND_ANSWERS.PROJECT_FOLDER_NAME]
		);
	}

	_executeAction(answers) {
		const projectName = answers[COMMAND_ANSWERS.PROJECT_FOLDER_NAME];
		const projectDirectory = answers[COMMAND_ANSWERS.PROJECT_ABSOLUTE_PATH];
		const manifestFilePath = path.join(
			projectDirectory,
			SOURCE_FOLDER,
			ApplicationConstants.MANIFEST_XML
		);

		const params = {
			//Enclose in double quotes to also support project names with spaces
			parentdirectory: CommandUtils.quoteString(
				answers[COMMAND_ANSWERS.PROJECT_ABSOLUTE_PATH]
			),
			type: answers[COMMAND_OPTIONS.TYPE],
			projectname: SOURCE_FOLDER,
			...(answers[COMMAND_OPTIONS.OVERWRITE] && { overwrite: '' }),
			...(answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP && {
				publisherid: answers[COMMAND_OPTIONS.PUBLISHER_ID],
				projectid: answers[COMMAND_OPTIONS.PROJECT_ID],
				projectversion: answers[COMMAND_OPTIONS.PROJECT_VERSION],
			}),
		};

		this._fileSystemService.createFolder(
			answers[COMMAND_OPTIONS.PARENT_DIRECTORY],
			answers[COMMAND_ANSWERS.PROJECT_FOLDER_NAME]
		);

		const actionCreateProject = new Promise(async (resolve, reject) => {
			const executionContextCreateProject = new SDKExecutionContext({
				command: this._commandMetadata.name,
				params: params,
			});

			const operationResult = await this._sdkExecutor.execute(executionContextCreateProject);

			if (SDKOperationResultUtils.hasErrors(operationResult)) {
				resolve({
					operationResult: operationResult,
					projectType: answers[COMMAND_OPTIONS.TYPE],
					projectDirectory: path.join(
						answers[COMMAND_OPTIONS.PARENT_DIRECTORY],
						projectName
					),
				});
				return;
			}

			if (answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP) {
				const oldPath = path.join(projectDirectory, projectName);
				const newPath = path.join(projectDirectory, SOURCE_FOLDER);
				this._fileSystemService.deleteFolderRecursive(newPath);
				this._fileSystemService.renameFolder(oldPath, newPath);
			}
			this._fileSystemService.replaceStringInFile(
				manifestFilePath,
				SOURCE_FOLDER,
				answers[COMMAND_OPTIONS.PROJECT_NAME]
			);

			await this._fileSystemService.createFileFromTemplate({
				template: TemplateKeys.PROJECTCONFIGS[CLI_CONFIG_TEMPLATE_KEY],
				destinationFolder: projectDirectory,
				fileName: CLI_CONFIG_FILENAME,
				fileExtension: CLI_CONFIG_EXTENSION,
			});

			return resolve({
				operationResult: operationResult,
				projectType: answers[COMMAND_OPTIONS.TYPE],
				projectDirectory: answers[COMMAND_ANSWERS.PROJECT_ABSOLUTE_PATH]
			});
		});

		return executeWithSpinner({
			action: actionCreateProject,
			message: TranslationService.getMessage(MESSAGES.CREATING_PROJECT),
		});
	}

	_formatOutput(result) {
		if (!result) {
			return;
		}
		if (SDKOperationResultUtils.hasErrors(result.operationResult)) {
			NodeUtils.println(
				TranslationService.getMessage(MESSAGES.PROCESS_FAILED),
				NodeUtils.COLORS.ERROR
			);
			SDKOperationResultUtils.logErrors(result.operationResult);
			return;
		}

		SDKOperationResultUtils.logMessages(result.operationResult);
		const projectTypeText =
			result.projectType === ApplicationConstants.PROJECT_SUITEAPP
				? SUITEAPP_PROJECT_TYPE_DISPLAY
				: ACCOUNT_CUSTOMIZATION_DISPLAY;
		const message = TranslationService.getMessage(
			MESSAGES.PROJECT_CREATED,
			projectTypeText,
			result.projectDirectory
		);
		NodeUtils.println(message, NodeUtils.COLORS.RESULT);
	}
};
