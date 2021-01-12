/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import VSConsoleLogger from '../loggers/VSConsoleLogger';
import { getSdkPath } from './sdksetup/SdkProperties';

import { CommandActionExecutor, CommandOptionsValidator, CLIConfigurationService, ApplicationConstants } from '../util/ExtensionUtil';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';

export default class SuiteCloudRunner {

	private commandActionExecutor: any;

	constructor(executionPath?: string) {
		process.argv.push(`${ApplicationConstants.PROJECT_FOLDER_ARG}=${executionPath}`);
		this.commandActionExecutor = new CommandActionExecutor({
			//THIS SHOULD BE A FACTORY METHOD INSIDE THE CLI CommandActionExecutorFactory.get({executionPath:executionPath})
			executionPath: executionPath,
			commandOptionsValidator: new CommandOptionsValidator(),
			cliConfigurationService: new CLIConfigurationService(),
			commandsMetadataService: CommandsMetadataSingleton.getInstance(),
			log: new VSConsoleLogger(true, executionPath),
			sdkPath: getSdkPath(),
		});
	}

	run(options: any) {
		options.runInInteractiveMode = false;
		return this.commandActionExecutor.executeAction(options);
	}

}
