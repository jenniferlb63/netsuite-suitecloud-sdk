/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const assert = require('assert');
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

class SetupCommandActionResult extends ActionResult {
	constructor(parameters) {
		super(parameters);
		this._mode = parameters.mode;
		this._authId = parameters.authId;
		this._accountInfo = parameters.accountInfo;
	}

	validateParameters(parameters) {
		assert(parameters);
		assert(parameters.status, 'status is required when creating an ActionResult object.');
		if (parameters.status === ActionResult.SUCCESS) {
			assert(parameters.mode, 'mode is required when ActionResult is a success.');
			assert(parameters.authId, 'authId is required when ActionResult is a success.');
			assert(parameters.accountInfo, 'accountInfo is required when ActionResult is a success.');
		}
		if (parameters.status === ActionResult.ERROR) {
			assert(parameters.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(parameters.errorMessages), 'errorMessages argument must be an array');
		}
	}

	get mode() {
		return this._mode;
	}

	get authId() {
		return this._authId;
	}

	get accountInfo() {
		return this._accountInfo;
	}

	static get Builder() {
		return new SetupActionResultBuilder();
	}
}

class SetupActionResultBuilder extends ActionResultBuilder {
	constructor() {
		super();
	}

	success() {
		this.status = ActionResult.SUCCESS;
		return this;
	}

	withMode(mode) {
		this.mode = mode;
		return this;
	}

	withAuthId(authId) {
		this.authId = authId;
		return this;
	}

	withAccountInfo(accountInfo) {
		this.accountInfo = accountInfo;
		return this;
	}

	build() {
		return new SetupCommandActionResult({
			status: this.status,
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.mode && { mode: this.mode }),
			...(this.authId && { authId: this.authId }),
			...(this.accountInfo && { accountInfo: this.accountInfo }),
			...(this.projectFolder && { projectFolder: this.projectFolder }),
		});
	}
}

module.exports = SetupCommandActionResult;
