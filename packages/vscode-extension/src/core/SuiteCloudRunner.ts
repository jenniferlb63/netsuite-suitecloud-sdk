/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import VSConsoleLogger from '../loggers/VSConsoleLogger';
import { sdkPath } from './sdksetup/SdkProperties';
import { CommandActionExecutor, CommandOptionsValidator, CLIConfigurationService, CommandInstanceFactory, AuthenticationService } from '../util/ExtensionUtil';

export default class SuiteCloudRunner {
	private commandActionExecutor: any;

	constructor(executionPath: string, commandsMetadataService: any) {
		this.commandActionExecutor = new CommandActionExecutor({
			//THIS SHOULD BE A FACTORY METHOD INSIDE THE CLI CommandActionExecutorFactory.get({executionPath:executionPath})
			executionPath,
			commandOptionsValidator: new CommandOptionsValidator(),
			cliConfigurationService: new CLIConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			authenticationService: new AuthenticationService(executionPath),
			commandsMetadataService: commandsMetadataService,
			consoleLogger: new VSConsoleLogger(),
			sdkPath: sdkPath,
		});
	}

	run(options: any) {
		options.runInInteractiveMode = false;
		return this.commandActionExecutor.executeAction(options);
	}
}
