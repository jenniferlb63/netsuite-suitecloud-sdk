/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const CreateProjectActionResult = require('../../services/actionresult/CreateProjectActionResult');
const BaseAction = require('../basecommand/BaseAction');
const TemplateKeys = require('../../templates/TemplateKeys');
const CommandUtils = require('../../utils/CommandUtils');
const NodeTranslationService = require('../../services/NodeTranslationService');
const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');
const SDKExecutionContext = require('../../SDKExecutionContext');
const ApplicationConstants = require('../../ApplicationConstants');
const NpmInstallRunner = require('../../services/NpmInstallRunner');
const FileSystemService = require('../../services/FileSystemService');
const unwrapExceptionMessage = require('../../utils/ExceptionUtils').unwrapExceptionMessage;
const {
	COMMAND_CREATEPROJECT: { MESSAGES },
} = require('../../services/TranslationKeys');

const path = require('path');

const JEST_CONFIG_FILENAME = 'jest.config.js';
const JEST_CONFIG_PROJECT_TYPE_ACP = 'SuiteCloudJestConfiguration.ProjectType.ACP';
const JEST_CONFIG_PROJECT_TYPE_SUITEAPP = 'SuiteCloudJestConfiguration.ProjectType.SUITEAPP';
const JEST_CONFIG_REPLACE_STRING_PROJECT_TYPE = '{{projectType}}';
const PACKAGE_JSON_FILENAME = 'package.json';
const PACKAGE_JSON_DEFAULT_VERSION = '1.0.0';
const PACKAGE_JSON_REPLACE_STRING_VERSION = '{{version}}';

const SOURCE_FOLDER = 'src';
const UNIT_TEST_TEST_FOLDER = '__tests__';

const CLI_CONFIG_TEMPLATE_KEY = 'cliconfig';
const CLI_CONFIG_FILENAME = 'suitecloud.config';
const CLI_CONFIG_EXTENSION = 'js';
const UNIT_TEST_CLI_CONFIG_TEMPLATE_KEY = 'cliconfig';
const UNIT_TEST_CLI_CONFIG_FILENAME = 'suitecloud.config';
const UNIT_TEST_CLI_CONFIG_EXTENSION = 'js';
const UNIT_TEST_PACKAGE_TEMPLATE_KEY = 'packagejson';
const UNIT_TEST_PACKAGE_FILENAME = 'package';
const UNIT_TEST_PACKAGE_EXTENSION = 'json';
const UNIT_TEST_JEST_CONFIG_TEMPLATE_KEY = 'jestconfig';
const UNIT_TEST_JEST_CONFIG_FILENAME = 'jest.config';
const UNIT_TEST_JEST_CONFIG_EXTENSION = 'js';
const UNIT_TEST_SAMPLE_TEST_KEY = 'sampletest';
const UNIT_TEST_SAMPLE_TEST_FILENAME = 'sample-test';
const UNIT_TEST_SAMPLE_TEST_EXTENSION = 'js';

const COMMAND_OPTIONS = {
	OVERWRITE: 'overwrite',
	PARENT_DIRECTORY: 'parentdirectory',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	TYPE: 'type',
	INCLUDE_UNIT_TESTING: 'includeunittesting',
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
	validateXMLCharacters,
	validateNotUndefined,
	validateProjectType,
} = require('../../validation/InteractiveAnswersValidator');

const { throwValidationException } = require('../../utils/ExceptionUtils');

module.exports = class CreateProjectCommandGenerator extends BaseAction {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
	}

	preExecute(params) {
		const projectFolderName = this._getProjectFolderName(params);
		if (projectFolderName) {
			params[COMMAND_OPTIONS.PARENT_DIRECTORY] = path.join(this._executionPath, projectFolderName);
			params[COMMAND_ANSWERS.PROJECT_FOLDER_NAME] = projectFolderName;
		} else {
			// parentdirectory is a mandatory option in javaCLI but it must be computed in the nodeCLI
			params[COMMAND_OPTIONS.PARENT_DIRECTORY] = 'not_specified';
		}

		return params;
	}

	async execute(params) {
		try {
			const projectFolderName = params[COMMAND_ANSWERS.PROJECT_FOLDER_NAME];
			const projectAbsolutePath = params[COMMAND_OPTIONS.PARENT_DIRECTORY];
			const manifestFilePath = path.join(projectAbsolutePath, SOURCE_FOLDER, ApplicationConstants.FILES.MANIFEST_XML);

			const validationErrors = this._validateParams(params);

			if (validationErrors.length > 0) {
				throwValidationException(validationErrors, false, this._commandMetadata);
			}

			const projectType = params[COMMAND_OPTIONS.TYPE];

			const params = {
				//Enclose in double quotes to also support project names with spaces
				parentdirectory: CommandUtils.quoteString(projectAbsolutePath),
				type: projectType,
				projectname: SOURCE_FOLDER,
				...(params[COMMAND_OPTIONS.OVERWRITE] && { overwrite: '' }),
				...(projectType === ApplicationConstants.PROJECT_SUITEAPP && {
					publisherid: params[COMMAND_OPTIONS.PUBLISHER_ID],
					projectid: params[COMMAND_OPTIONS.PROJECT_ID],
					projectversion: params[COMMAND_OPTIONS.PROJECT_VERSION],
				}),
			};

			this._fileSystemService.createFolder(this._executionPath, projectFolderName);

			const createProjectAction = new Promise(this.createProject(params, params, projectAbsolutePath, projectFolderName, manifestFilePath));

			const createProjectActionData = await createProjectAction;

			const projectName = params[COMMAND_OPTIONS.PROJECT_NAME];
			const includeUnitTesting = params[COMMAND_OPTIONS.INCLUDE_UNIT_TESTING];

			return createProjectActionData.operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? CreateProjectActionResult.Builder.withData(createProjectActionData.operationResult.data)
						.withResultMessage(createProjectActionData.operationResult.resultMessage)
						.withProjectType(projectType)
						.withProjectName(projectName)
						.withProjectDirectory(createProjectActionData.projectDirectory)
						.withUnitTesting(includeUnitTesting)
						.withNpmPackageInitialized(createProjectActionData.npmInstallSuccess)
						.build()
				: CreateProjectActionResult.Builder.withErrors(
						SDKOperationResultUtils.collectErrorMessages(createProjectActionData.operationResult)
				  ).build();
		} catch (error) {
			return CreateProjectActionResult.Builder.withErrors([unwrapExceptionMessage(error)]).build();
		}
	}

	createProject(params, params, projectAbsolutePath, projectFolderName, manifestFilePath) {
		return async (resolve, reject) => {
			try {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.CREATING_PROJECT_STRUCTURE));
				if (params[COMMAND_OPTIONS.OVERWRITE]) {
					this._fileSystemService.emptyFolderRecursive(projectAbsolutePath);
				}
				const executionContextCreateProject = new SDKExecutionContext({
					command: this._commandMetadata.sdkCommand,
					params: params,
				});

				const operationResult = await this._sdkExecutor.execute(executionContextCreateProject);

				if (operationResult.status === SDKOperationResultUtils.STATUS.ERROR) {
					resolve({
						operationResult: operationResult,
						projectType: params[COMMAND_OPTIONS.TYPE],
						projectDirectory: projectAbsolutePath,
					});
					return;
				}
				if (params[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP) {
					const oldPath = path.join(projectAbsolutePath, projectFolderName);
					const newPath = path.join(projectAbsolutePath, SOURCE_FOLDER);
					this._fileSystemService.deleteFolderRecursive(newPath);
					this._fileSystemService.renameFolder(oldPath, newPath);
				}
				this._fileSystemService.replaceStringInFile(manifestFilePath, SOURCE_FOLDER, params[COMMAND_OPTIONS.PROJECT_NAME]);
				let npmInstallSuccess;
				if (params[COMMAND_OPTIONS.INCLUDE_UNIT_TESTING]) {
					this._log.info(NodeTranslationService.getMessage(MESSAGES.SETUP_TEST_ENV));
					await this._createUnitTestFiles(
						params[COMMAND_OPTIONS.TYPE],
						params[COMMAND_OPTIONS.PROJECT_NAME],
						params[COMMAND_OPTIONS.PROJECT_VERSION],
						projectAbsolutePath
					);

					this._log.info(NodeTranslationService.getMessage(MESSAGES.INIT_NPM_DEPENDENCIES));
					npmInstallSuccess = await this._runNpmInstall(projectAbsolutePath);
				} else {
					await this._fileSystemService.createFileFromTemplate({
						template: TemplateKeys.PROJECTCONFIGS[CLI_CONFIG_TEMPLATE_KEY],
						destinationFolder: projectAbsolutePath,
						fileName: CLI_CONFIG_FILENAME,
						fileExtension: CLI_CONFIG_EXTENSION,
					});
				}
				return resolve({
					operationResult: operationResult,
					projectDirectory: projectAbsolutePath,
					npmInstallSuccess: npmInstallSuccess,
				});
			} catch (error) {
				this._fileSystemService.deleteFolderRecursive(path.join(this._executionPath, projectFolderName));
				reject(error);
			}
		};
	}

	_getProjectFolderName(params) {
		return params[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP
			? params[COMMAND_OPTIONS.PUBLISHER_ID] + '.' + params[COMMAND_OPTIONS.PROJECT_ID]
			: params[COMMAND_OPTIONS.PROJECT_NAME];
	}

	async _createUnitTestFiles(type, projectName, projectVersion, projectAbsolutePath) {
		await this._createUnitTestCliConfigFile(projectAbsolutePath);
		await this._createUnitTestPackageJsonFile(type, projectName, projectVersion, projectAbsolutePath);
		await this._createJestConfigFile(type, projectAbsolutePath);
		await this._createSampleUnitTestFile(projectAbsolutePath);
	}

	async _createUnitTestCliConfigFile(projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_CLI_CONFIG_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: UNIT_TEST_CLI_CONFIG_FILENAME,
			fileExtension: UNIT_TEST_CLI_CONFIG_EXTENSION,
		});
	}

	async _createUnitTestPackageJsonFile(type, projectName, projectVersion, projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_PACKAGE_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: UNIT_TEST_PACKAGE_FILENAME,
			fileExtension: UNIT_TEST_PACKAGE_EXTENSION,
		});

		let packageJsonAbsolutePath = path.join(projectAbsolutePath, PACKAGE_JSON_FILENAME);

		let version = PACKAGE_JSON_DEFAULT_VERSION;
		if (type === ApplicationConstants.PROJECT_SUITEAPP) {
			version = projectVersion;
		}
		await this._fileSystemService.replaceStringInFile(packageJsonAbsolutePath, PACKAGE_JSON_REPLACE_STRING_VERSION, version);
	}

	async _createJestConfigFile(type, projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_JEST_CONFIG_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: UNIT_TEST_JEST_CONFIG_FILENAME,
			fileExtension: UNIT_TEST_JEST_CONFIG_EXTENSION,
		});

		let jestConfigProjectType = JEST_CONFIG_PROJECT_TYPE_ACP;
		if (type === ApplicationConstants.PROJECT_SUITEAPP) {
			jestConfigProjectType = JEST_CONFIG_PROJECT_TYPE_SUITEAPP;
		}
		let jestConfigAbsolutePath = path.join(projectAbsolutePath, JEST_CONFIG_FILENAME);
		await this._fileSystemService.replaceStringInFile(jestConfigAbsolutePath, JEST_CONFIG_REPLACE_STRING_PROJECT_TYPE, jestConfigProjectType);
	}

	async _createSampleUnitTestFile(projectAbsolutePath) {
		let testsFolderAbsolutePath = this._fileSystemService.createFolder(projectAbsolutePath, UNIT_TEST_TEST_FOLDER);
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_SAMPLE_TEST_KEY],
			destinationFolder: testsFolderAbsolutePath,
			fileName: UNIT_TEST_SAMPLE_TEST_FILENAME,
			fileExtension: UNIT_TEST_SAMPLE_TEST_EXTENSION,
		});
	}

	async _runNpmInstall(projectAbsolutePath) {
		try {
			await NpmInstallRunner.run(projectAbsolutePath);
			return true;
		} catch (error) {
			return false;
		}
	}

	_validateParams(answers) {
		const validationErrors = [];
		validationErrors.push(showValidationResults(answers[COMMAND_OPTIONS.PROJECT_NAME], validateFieldIsNotEmpty, validateXMLCharacters));
		validationErrors.push(showValidationResults(answers[COMMAND_OPTIONS.TYPE], validateProjectType));
		if (answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP) {
			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PUBLISHER_ID],
					(optionValue) => validateNotUndefined(optionValue, COMMAND_OPTIONS.PUBLISHER_ID),
					validatePublisherId
				)
			);

			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PROJECT_VERSION],
					(optionValue) => validateNotUndefined(optionValue, COMMAND_OPTIONS.PROJECT_VERSION),
					validateProjectVersion
				)
			);

			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PROJECT_ID],
					(optionValue) => validateNotUndefined(optionValue, COMMAND_OPTIONS.PROJECT_ID),
					validateFieldIsNotEmpty,
					validateFieldHasNoSpaces,
					(optionValue) => validateFieldIsLowerCase(COMMAND_OPTIONS.PROJECT_ID, optionValue)
				)
			);
		}

		return validationErrors.filter((item) => item !== true);
	}
};
