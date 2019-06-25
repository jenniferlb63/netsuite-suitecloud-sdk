'use strict';

const Theme = require('./Theme');
const Extension = require('./Extension');
const path = require('path');

const _ = require('underscore');

module.exports = class CompilationContext {
	constructor(options) {
		const objects_path = options.objects_path;
		const theme = options.theme;
		const extensions = options.extensions || [];

		this.files_path = options.files_path;
		this.project_folder = options.project_folder;

		this.theme = new Theme({ objects_path: objects_path, extension_xml: theme });

		this.extensions = _.map(extensions, extension => {
			return new Extension({ objects_path: objects_path, extension_xml: extension });
		});
	}

	setLocalServerPath(path) {
		this.local_server_path = path;
	}

	getTplOverrides() {
		return this.theme.getTplOverrides();
	}

	getSassOverrides() {
		return this.theme.getSassOverrides();
	}

	getAllExtensions() {
		return [this.theme].concat(this.extensions);
	}

	getSass() {
		let sass = {
			files: [],
			entrypoints: {},
		};
		const extensions = this.getAllExtensions();

		_.each(extensions, extension => {
			const ext_sass = extension.getSass();
			const ext_assets_path = extension.getLocalAssetsPath('assets');

			_.each(ext_sass.entrypoints, (app_sass, app) => {
				sass.entrypoints[app] = sass.entrypoints[app] || [];
				sass.entrypoints[app].push({
					entry: app_sass,
					assets_path: ext_assets_path,
				});
			});

			sass.files = _.union(sass.files, ext_sass.files);
		});

		return sass;
	}

	getJavascript() {
		let javascript = {
			applications: {},
			entrypoints: {},
		};
		const extensions = this.extensions;

		_.each(extensions, extension => {
			const ext_javascript = extension.getJavascript();

			_.each(ext_javascript.entrypoints, (app_javascript, app) => {
				javascript.entrypoints[app] = javascript.entrypoints[app] || [];
				javascript.entrypoints[app].push(app_javascript);
			});

			_.each(ext_javascript.applications, (app_javascript, app) => {
				javascript.applications[app] = javascript.applications[app] || [];
				javascript.applications[app] = _.union(
					javascript.applications[app],
					app_javascript
				);
			});
		});

		return javascript;
	}

	getAssets() {
		let assets = {};
		const extensions = this.extensions.concat(this.theme);

		_.each(extensions, extension => {
			const ext_assets = extension.getAssets();
			assets = _.union(assets, ext_assets);
		});

		return assets;
	}

	getExtensionByFile(file) {
		let found = { base_path: '' };
		this.getAllExtensions().forEach(extension => {
			if (extension.have(file) && extension.base_path.length > found.base_path.length) {
				found = extension;
			}
		});
		return found;
	}

	excludeBaseFilesPath(dir) {
		return path.normalize(dir).replace(this.files_path, '');
	}
};
