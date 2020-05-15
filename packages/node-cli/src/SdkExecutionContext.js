/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const AuthenticationService = require('./services/AuthenticationService');

class SdkExecutionContext {
	constructor(options) {
		assert(options.command, 'Command is mandatory option');
		this._command = options.command;
		this._integrationMode = options.integrationMode;
		this._developmentMode = options.developmentMode;
		this._params = options.params;
		this._flags = options.flags;
	}

	getCommand() {
		return this._command;
	}

	getParams() {
		return this._params;
	}

	getFlags() {
		return this._flags;
	}

	isIntegrationMode() {
		return this._integrationMode;
	}

	static get Builder() {
		return new SdkExecutionContextBuilder();
	}
	
};

class SdkExecutionContextBuilder {

	constructor() {
		this._params = {};
		this._flags = [];
		this._integrationMode = false;
		this._developmentMode = false;
	}

	forCommand(command) {
		this._command = command;
		return this;
	}

	integration() {
		this._integrationMode = true;
		return this;
	}

	withDefaultAuthId(projectPath) {
		return this.addParam('authId', new AuthenticationService().getProjectDefaultAuthId(projectPath));
	}

	withAuthId(authId) {
		return this.addParam('authId', authId);
	}

	devMode() {
		this._developmentMode = true;
		return this;
	}

	addParams(params) {
		Object.keys(params).forEach((key) => {
			addParam(key, params[key]);
		});
		return this;
	}

	addParam(param, value) {
		this._params[`-${param}`] = value;
		return this;
	}

	addFlags(flags) {
		flags.forEach(flag => {
			addFlag(flag);
		});
		return this;
	}

	addFlag(flag) {
		this._flags.push(`-${flag}`);
		return this;
	}

	build() {
		return new SdkExecutionContext({
			command: this._command,
			params: this._params,
			flags: this._flags,
			integrationMode: this._integrationMode,
			developmentMode: this._developmentMode,
		})
	}
}

module.exports = SdkExecutionContext;