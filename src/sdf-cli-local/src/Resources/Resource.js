const _ = require('underscore');
const Utils = require('../Utils');
const path = require('path');
const Log = require('../services/Log');
const FileSystem = require('../services/FileSystem');

let _basesrc = '';

module.exports = class Resource {
	constructor(options) {
		this.src = options.src;
		this.dst = options.dst;
		this.name = options.name;
		this.format = options.format || '';
		this.content = '';
		this.extension_asset_url = options.extension_asset_url;
		this.extension_fullname = options.extension_fullname;
		this.applications = _.flatten([options.app]);
		this.override_fullsrc;
		this.override;
	}

	sourceContent() {
		return FileSystem.getFileContent(this.fullsrc()).then(content => {
			return (this.content = content);
		});
	}

	addApplication(app) {
		this.applications = _.union(this.applications, [app]);
	}

	logOverrideMessage() {
		if (this.override) {
			Log.default('OVERRIDE', [this.src, this.override]);
		}
	}

	fullsrc() {
		return this.override_fullsrc || path.join(_basesrc, this.src);
	}

	fulldst() {
		return this.dst;
	}

	getBasename() {
		return path.basename(this.src);
	}

	getFilename() {
		return this.name + this.format;
	}

	static setBaseSrc(value) {
		_basesrc = value;
	}
};
