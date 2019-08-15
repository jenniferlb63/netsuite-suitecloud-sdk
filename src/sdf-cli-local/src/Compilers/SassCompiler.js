/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const Utils = require('../Utils');
const FileSystem = require('../services/FileSystem');
const Log = require('../services/Log');
const sass_compiler = require('node-sass');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

module.exports = class SassCompiler {
	constructor(options) {
		this.context = options.context;
		this.resource_type = 'Sass';
	}

	compile(resources) {
		Log.result('COMPILATION_START', [this.resource_type]);
		this._createCssFolder();
		this.overrides = this.context.getSassOverrides();
		resources = this.context.getSass();

		const meta_entrypoints = this._buildMetaEntrypoints(resources.entrypoints);

		return Utils.runParallel(meta_entrypoints).then(() => {
			Log.result('COMPILATION_FINISH', [this.resource_type]);
		});
	}

	_createCssFolder() {
		this.css_path = FileSystem.createFolder('css', this.context.local_server_path);
	}

	_buildMetaEntrypoints(entrypoints) {
		const promises = [];
		for (const app in entrypoints) {
			const entrypoint = entrypoints[app]
				.map(file => {
					const local_functions = this._localFunctions({
						assets_folder: FileSystem.forwardDashes(file.assets_path),
					});
					file.entry = FileSystem.forwardDashes(file.entry);
					return local_functions + `@import "${file.entry}";`;
				})
				.join('');
			promises.push(() => this._compile(entrypoint, app));
		}
		return promises;
	}

	_compile(entrypoint, app) {
		return new Promise((resolve, reject) => {
			Log.result('COMPILATION_START_FOR', [this.resource_type, app]);
			sass_compiler.render(
				{
					data: entrypoint,
					includePaths: [this.context.files_path],
					importer: this._importer.bind(this),
				},
				(error, result) => {
					if (error) {
						return reject(error);
					}

					const local_path = path.join(this.css_path, app + '.css');
					fs.writeFileSync(local_path, result.css);

					Log.result('COMPILATION_FINISH_FOR', [this.resource_type, app]);
					resolve(local_path);
				}
			);
		});
	}

	_localFunctions(options = {}) {
		return [
			`@function getThemeAssetsPath($asset) { @return '../${
				options.assets_folder
			}/' + $asset; }`,
			`@function getExtensionAssetsPath($asset) { @return '../${
				options.assets_folder
			}/' + $asset; }`,
		].join('\n');
	}

	_importer(url, prev, done) {
		prev = prev === 'stdin' ? this.context.files_path : path.dirname(prev);

		let current_path = path.normalize(path.resolve(prev, url));
		current_path = path.extname(current_path) ? current_path : current_path + '.scss';
		current_path = current_path.replace(this.context.files_path, '').substr(1);

		const override = this.overrides[current_path];
		let result;
		if (override) {
			Log.default('OVERRIDE', [current_path, override.src]);
			const full_path = glob(path.join(this.context.project_folder, '**', override.src));
			if (full_path.length) {
				result = { file: full_path[0] };
			}
		}
		done(result);
	}
};
