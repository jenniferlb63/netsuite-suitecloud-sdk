/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { Uri, commands, window } from 'vscode';
import { ANSWERS, CREATE_PROJECT } from '../service/TranslationKeys';
import { ApplicationConstants, FileSystemService, InteractiveAnswersValidator } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import * as os from 'os';
import * as path from 'path';

const COMMAND_NAME = 'createproject';
const COMMAND_ARGUMENTS = {
    INCLUDE_UNIT_TESTING: 'includeunittesting',
    OVERWRITE: 'overwrite',
    PARENT_DIRECTORY: 'parentdirectory',
    PROJECT_ID: 'projectid',
    PROJECT_FOLDER_NAME: 'projectfoldername',
    PROJECT_NAME: 'projectname',
    PROJECT_VERSION: 'projectVersion',
    PUBLISHER_ID: 'publisherid',
    TYPE: 'type',
};
const VSCODE_OPEN_FOLDER_COMMAND = 'vscode.openFolder';

export default class CreateProject extends BaseAction {

	constructor() {
		super(COMMAND_NAME);
	}

    protected async execute(): Promise<void> {
        const commandArgs = await this.getCommandArgs();
        if (Object.keys(commandArgs).length === 0) {
            return;
        }

        const actionResult = await this.runSuiteCloudCommand(commandArgs);
        if (actionResult.isSuccess()) {
            await this.openProjectInNewWindow(actionResult.projectDirectory);
        }
    }

    private async openProjectInNewWindow(projectAbsolutePath: string): Promise<void> {
        const openProjectInNewWindow = await window.showInformationMessage(
            this.translationService.getMessage(CREATE_PROJECT.MESSAGES.OPEN_PROJECT),
            this.translationService.getMessage(CREATE_PROJECT.BUTTONS.THIS_WINDOW),
            this.translationService.getMessage(CREATE_PROJECT.BUTTONS.NEW_WINDOW),
        );

        commands.executeCommand(
            VSCODE_OPEN_FOLDER_COMMAND,
             Uri.file(projectAbsolutePath),
            {
                forcenewwindow: openProjectInNewWindow ? CREATE_PROJECT.BUTTONS.NEW_WINDOW : false,
            }
        );
    }

    private async getCommandArgs(): Promise<{ [key: string]: string }> {
        const commandArgs: { [key: string]: string } = {};

        const selectedFolder = await window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            title: this.translationService.getMessage(CREATE_PROJECT.SELECT_PARENT_FOLDER),
            defaultUri: Uri.file(os.homedir()),
        });
        if (!selectedFolder) {
            return {};
        }

        let projectType = await this.promptSelectProjectTypeQuestion();
        if (!projectType) {
            return {};
        }
        commandArgs[COMMAND_ARGUMENTS.TYPE] = this.translationService.getMessage(CREATE_PROJECT.PROJECT_TYPE.SUITEAPP)
            ? ApplicationConstants.PROJECT_ACP
            : ApplicationConstants.PROJECT_SUITEAPP;

        const projectName = await this.promptProjectNameQuestion();
        if (!projectName) {
            return {};
        }
        commandArgs[COMMAND_ARGUMENTS.PROJECT_NAME] = projectName;

        let publisherId, projectId, projectVersion;
        if (projectType === this.translationService.getMessage(CREATE_PROJECT.PROJECT_TYPE.SUITEAPP)) {
            publisherId = await this.promptPublisherIdQuestion();
            if (publisherId === undefined) {
                return {};
            }
            commandArgs[COMMAND_ARGUMENTS.PUBLISHER_ID] = publisherId;

            projectId = await this.promptProjectIdQuestion();
            if (!projectId) {
                return {};
            }
            commandArgs[COMMAND_ARGUMENTS.PROJECT_ID] = projectId;

            projectVersion = await this.promptProjectVersionQuestion();
            if (!projectVersion) {
                return {};
            }
            commandArgs[COMMAND_ARGUMENTS.PROJECT_VERSION] = projectVersion;

            commandArgs[COMMAND_ARGUMENTS.PROJECT_FOLDER_NAME] = publisherId + '.' + projectId;
        } else {
            commandArgs[COMMAND_ARGUMENTS.PROJECT_FOLDER_NAME] = projectName;
        }
        commandArgs[COMMAND_ARGUMENTS.PARENT_DIRECTORY] = path.join(selectedFolder[0].fsPath, commandArgs[COMMAND_ARGUMENTS.PROJECT_FOLDER_NAME]);

        const includeUnitTesting = await this.promptIncludeUnitTestingQuestion();
        if (!includeUnitTesting) {
            return {};
        }
        commandArgs[COMMAND_ARGUMENTS.INCLUDE_UNIT_TESTING] = includeUnitTesting === this.translationService.getMessage(ANSWERS.NO) ? 'false' : 'true';

        const projectAbsolutePath = commandArgs[COMMAND_ARGUMENTS.PARENT_DIRECTORY];
        const fileSystemService = new FileSystemService();
        if (fileSystemService.folderExists(projectAbsolutePath) && !fileSystemService.isFolderEmpty(projectAbsolutePath)) {
            const overwriteProject = await this.promptOverwriteFilesQuestion(projectAbsolutePath);
            if (!overwriteProject) {
                return {};
            }
            commandArgs[COMMAND_ARGUMENTS.OVERWRITE] = overwriteProject === this.translationService.getMessage(ANSWERS.NO) ? 'false' : 'true'; 
        }

        return commandArgs;
    }

    private promptOverwriteFilesQuestion(projectAbsolutePath: string): Thenable<string | undefined> {
        return window.showQuickPick(
            [this.translationService.getMessage(ANSWERS.NO), this.translationService.getMessage(ANSWERS.YES)],
            {
                canPickMany: false,
                placeHolder: this.translationService.getMessage(CREATE_PROJECT.QUESTIONS.OVERWRITE_PROJECT, projectAbsolutePath),
            }
        );
    }

    private promptIncludeUnitTestingQuestion(): Thenable<string | undefined> {
        return window.showQuickPick(
            [this.translationService.getMessage(ANSWERS.NO), this.translationService.getMessage(ANSWERS.YES)],
            {
                canPickMany: false,
                placeHolder: this.translationService.getMessage(CREATE_PROJECT.QUESTIONS.INCLUDE_UNIT_TESTING),
            }
        );
    }

    private promptProjectVersionQuestion(): Thenable<string | undefined> {
        return window.showInputBox(
            {
                ignoreFocusOut: true,
                placeHolder: this.translationService.getMessage(CREATE_PROJECT.QUESTIONS.ENTER_PROJECT_VERSION),
                validateInput: (fieldValue) => {
                    let validationResult = InteractiveAnswersValidator.showValidationResults(
                        fieldValue,
                        InteractiveAnswersValidator.validateFieldIsNotEmpty,
                        InteractiveAnswersValidator.validateProjectVersion,
                    );
                    return typeof validationResult === 'string' ? validationResult : null;
                },
            }
        );
    }

    private promptProjectIdQuestion(): Thenable<string | undefined> {
        return window.showInputBox(
            {
                ignoreFocusOut: true,
                placeHolder: this.translationService.getMessage(CREATE_PROJECT.QUESTIONS.ENTER_PROJECT_ID),
                validateInput: (fieldValue) => {
                    let validationResult = InteractiveAnswersValidator.showValidationResults(
                        fieldValue,
                        InteractiveAnswersValidator.validateFieldIsNotEmpty,
                        InteractiveAnswersValidator.validateFieldHasNoSpaces,
                        (fieldValue: string) => InteractiveAnswersValidator.validateFieldIsLowerCase(
                            this.translationService.getMessage(CREATE_PROJECT.QUESTIONS.ENTER_PROJECT_ID),
                            fieldValue
                        ),
                    );
                    return typeof validationResult === 'string' ? validationResult : null;
                },
            }
        );
    }

    private promptPublisherIdQuestion(): Thenable<string | undefined> {
        return window.showInputBox(
            {
                ignoreFocusOut: true,
                placeHolder: this.translationService.getMessage(CREATE_PROJECT.QUESTIONS.ENTER_PUBLISHER_ID),
                validateInput: (fieldValue) => {
                    let validationResult = InteractiveAnswersValidator.showValidationResults(
                        fieldValue,
                        InteractiveAnswersValidator.validateFieldIsNotEmpty,
                        InteractiveAnswersValidator.validatePublisherId,
                    );
                    return typeof validationResult === 'string' ? validationResult : null;
                },
            }
        );
    }

    private promptProjectNameQuestion(): Thenable<string | undefined> {
        return window.showInputBox(
            {
                ignoreFocusOut: true,
                placeHolder: this.translationService.getMessage(CREATE_PROJECT.QUESTIONS.ENTER_PROJECT_NAME),
                validateInput: (fieldValue) => {
                    let validationResult = InteractiveAnswersValidator.showValidationResults(
                        fieldValue,
                        InteractiveAnswersValidator.validateFieldIsNotEmpty,
                        InteractiveAnswersValidator.validateAlphanumericHyphenUnderscoreExtended,
                    );
                    return typeof validationResult === 'string' ? validationResult : null;
                },
            }
        );
    }

    private promptSelectProjectTypeQuestion(): Thenable<string | undefined> {
        return window.showQuickPick(
            [this.translationService.getMessage(CREATE_PROJECT.PROJECT_TYPE.ACP), this.translationService.getMessage(CREATE_PROJECT.PROJECT_TYPE.SUITEAPP)],
            {
                canPickMany: false,
                placeHolder: this.translationService.getMessage(CREATE_PROJECT.QUESTIONS.CHOOSE_PROJECT_TYPE),
            }
        );
    }

}
