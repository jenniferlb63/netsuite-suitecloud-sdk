/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { assert } from 'console';
import * as vscode from 'vscode';
import { Uri, window } from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import MessageService from '../service/MessageService';
import { ERRORS } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import { CLIConfigurationService } from '../util/ExtensionUtil';
import {commandsInfoMap, CommandsInfoMapType} from '../commandsMap';


export default abstract class BaseAction {
	protected readonly translationService: VSTranslationService;
	protected isSelectedFromContextMenu?: boolean;
	protected readonly messageService: MessageService;
	protected readonly vscodeCommandName: string;
	protected readonly cliCommandName: string;
	protected executionPath?: string;
	protected vsConsoleLogger!: VSConsoleLogger;
	protected activeFile?: string;

	protected abstract execute(): Promise<void>;

	constructor(commandName: keyof CommandsInfoMapType) {
		this.cliCommandName = commandsInfoMap[commandName].cliCommandName;
		this.vscodeCommandName = commandsInfoMap[commandName].vscodeCommandName;
		this.messageService = new MessageService(this.vscodeCommandName);
		this.translationService = new VSTranslationService();
	}

	protected init(uri?: Uri) {
		this.executionPath = this.getRootProjectFolder(uri);
		const fsPath = uri?.fsPath;
		this.vsConsoleLogger = new VSConsoleLogger(true, this.executionPath);
		this.messageService.executionPath = this.executionPath;
		this.isSelectedFromContextMenu = fsPath ? true : false;
		this.activeFile = fsPath ? fsPath : window.activeTextEditor?.document.uri.fsPath;
	}

	protected validate(): { valid: false; message: string } | { valid: true } {
		if (!this.executionPath) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_FILE),
			};
		} else {
			return {
				valid: true,
			};
		}
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string | string[] } = {}, otherExecutionPath?: string) {
		const suiteCloudRunnerRunResult = await new SuiteCloudRunner(
			this.vsConsoleLogger,
			otherExecutionPath !== undefined ? otherExecutionPath : this.executionPath
		).run({
			commandName: this.cliCommandName,
			arguments: args,
		});

		this.vsConsoleLogger.info('');

		return suiteCloudRunnerRunResult;
	}

	/**
	 * To get the projectFolderPath, the action must have been triggered within a project context.
	 *
	 * @returns {string} the projectFolderPath or undefined if the action was not triggered within a project context
	 */
	protected getProjectFolderPath(): string {
		const cliConfigurationService = new CLIConfigurationService();
		cliConfigurationService.initialize(this.executionPath);

		return cliConfigurationService.getProjectFolder(this.cliCommandName);
	}

	// returns the root project folder of the active file in the editor if uri not defined
	// uri is present when action originated from a contextMenu of the treeView
	// works fine with workspace with multiple project folders opened
	public getRootProjectFolder(uri?: vscode.Uri): string | undefined {
		if (!uri?.fsPath) {
			const activeTextEditor = vscode.window.activeTextEditor;
			const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : undefined;
			return activeWorkspaceFolder ? activeWorkspaceFolder.uri.fsPath : undefined;
		} else {
			const activeWorkspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
			return activeWorkspaceFolder?.uri.fsPath;
		}
	}

	public async run(uri?: Uri) {
		this.init(uri);
		const validationStatus = this.validate();
		if (validationStatus.valid) {
			return this.execute();
		} else {
			this.messageService.showErrorMessage(validationStatus.message);
			return;
		}
	}
}
