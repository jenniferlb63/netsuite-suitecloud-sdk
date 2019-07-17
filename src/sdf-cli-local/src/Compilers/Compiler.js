'use strict';

const SassCompiler = require('./SassCompiler');
const TemplatesCompiler = require('./TemplatesCompiler');
const JavascriptCompiler = require('./JavascriptCompiler');
const AssetsCompiler = require('./AssetsCompiler');

const Utils = require('../Utils');
const FileSystem = require('../services/FileSystem');
const _ = require('underscore');

module.exports = class Compiler {
	constructor(options) {
		this.context = options.context;
		this.compilers = {
			sass: new SassCompiler({ context: this.context }),
			templates: new TemplatesCompiler({ context: this.context }),
			javascript: new JavascriptCompiler({ context: this.context }),
			assets: new AssetsCompiler({ context: this.context }),
		};
	}

	compile() {
		this._createLocalServerFolder(this.context);

		const binded_compilers = _.map(this.compilers, compiler =>
			_.bind(compiler.compile, compiler)
		);
		return Utils.runParallel(binded_compilers);
	}

	_createLocalServerFolder(context) {
		const serverFolder = 'LocalServer';
		// create/override local server:
		const local_folder = FileSystem.createFolder(serverFolder, context.project_folder, true);
		context.setLocalServerPath(local_folder);
	}
};
