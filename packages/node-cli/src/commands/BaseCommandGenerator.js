/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const Command = require('./Command');
const assert = require('assert');
const AuthenticationService = require('../core/authentication/AuthenticationService');
const NodeConsoleLogger = require('../loggers/NodeConsoleLogger');

module.exports = class BaseCommandGenerator {
	constructor(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);
		assert(typeof options.runInInteractiveMode === 'boolean');
		assert(options.consoleLogger);

		this._sdkExecutor = new SDKExecutor(new AuthenticationService(options.executionPath));

		this._commandMetadata = options.commandMetadata;
		this._projectFolder = options.projectFolder;
		this._executionPath = options.executionPath;
		this._runInInteractiveMode = options.runInInteractiveMode;
		this._consoleLogger = options.consoleLogger;
	}

	_getCommandQuestions(prompt) {
		return prompt([]);
	}

	_executeAction() {}

	_preExecuteAction(args) {
		return args;
	}

	create() {
		return new Command({
			commandMetadata: this._commandMetadata,
			projectFolder: this._projectFolder,
			getCommandQuestionsFunc: this._getCommandQuestions.bind(this),
			preActionFunc: this._preExecuteAction.bind(this),
			actionFunc: this._executeAction.bind(this),
			formatActionResultFunc: this._formatActionResult ? this._formatActionResult.bind(this) : null,
			consoleLogger: this._consoleLogger ? this._consoleLogger : NodeConsoleLogger,
		});
	}

	get consoleLogger() {
		return this._consoleLogger;
	}
};
