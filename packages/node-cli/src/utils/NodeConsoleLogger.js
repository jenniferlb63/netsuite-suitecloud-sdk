/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const chalk = require('chalk');
const ConsoleLogger = require('./ConsoleLogger');

class NodeConsoleLogger extends ConsoleLogger {
	println(message, color) {
		console.log(this.formatString(message, { color: color }));
	}

	formatString(str, options) {
		const color = options.color || ConsoleLogger.COLORS.DEFAULT;
		const bold = options.bold ? chalk.bold : str => str;
		return bold(color(str));
	}

	// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
}

module.exports = new NodeConsoleLogger();
