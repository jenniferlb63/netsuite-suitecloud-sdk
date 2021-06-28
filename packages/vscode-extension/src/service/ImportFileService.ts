/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import MessageService from './MessageService';

const SUITECLOUD_COMMAND_NAME = 'file:import';
const CONSOLE_LOGGER_ERROR = 'vsConsole Logger not initialized';

export default class ImportFileService {
	private executionPath?: string;
	private readonly messageService: MessageService;
	private vsConsoleLogger: VSConsoleLogger | undefined;

	constructor(messageService: MessageService) {
		this.messageService = messageService;
	}

	async importFiles(
		selectedFilesPaths: string[],
		directory: string,
		statusBarMessage: string,
		executionPath: string | undefined,
		excludeProperties: boolean
	) {
		this.executionPath = executionPath;
		let commandArgs: any = { project: directory, paths: selectedFilesPaths };

		if (excludeProperties) {
			commandArgs.excludeproperties = true;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}) {
		if (!this.vsConsoleLogger) {
			throw Error(CONSOLE_LOGGER_ERROR);
		}
		return new SuiteCloudRunner(this.vsConsoleLogger, this.executionPath).run({
			commandName: SUITECLOUD_COMMAND_NAME,
			arguments: args,
		});
	}

	setVsConsoleLogger(vsConsoleLogger: VSConsoleLogger) {
		this.vsConsoleLogger = vsConsoleLogger;
	}
}
