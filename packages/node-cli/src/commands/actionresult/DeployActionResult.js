/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');
const ActionResult = require('./ActionResult');

class DeployActionResult extends ActionResult {

	constructor(build) {
		super(build)
		this._isValidate = build._isValidate ? true:false;
		this._isApplyProtection = build._isApplyProtection ? true : false
	}

	validateBuild(build) {
		assert(build);
		assert(build.status, "status is required when creating an ActionResult object.");
		if (build.status === SUCCESS) {
			assert(build.data, "data is required when ActionResult is a success.");
			assert(build.resultMessage, "resultMessage is required when ActionResult is a success.");
		}
		if (build.status === ERROR) {
			assert(build.error, "error is required when ActionResult is an error.");
		}
	}

	get isValidate() {
		return this._isValidate;
	}

	get isApplyProtection() {
		return this._isApplyProtection;
	}

	static get Builder() {
		return new class Builder {
			constructor() { }

			withSuccess(data, resultMessage) {
				this.status = SUCCESS;
				this.data = data;
				this.resultMessage = resultMessage;
				return this;
			}

			withError(error) {
				this.status = ERROR;
				this.error = error;
				return this;
			}

			build() {
				return new DeployActionResult({
					status: this.status,
					...(this.data && {data: this.data}),
					...(this.resultMessage && { resultMessage: this.resultMessage }),
					...(this.error && { error: this.error }),
					...(this.isValidate && {isValidate: this.isValidate}),
					...(this.isApplyProtection && {isApplyProtection: this.isApplyProtection})
				});
			}
		};
	}
};

module.exports = DeployActionResult;