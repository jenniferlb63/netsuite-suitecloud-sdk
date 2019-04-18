'use strict';

const DeployXml = require('./DeployXml');
const Compiler = require('./Compilers/Compiler');
const CompilationContext = require('./CompilationContext');
const LocalServer = require('./LocalServer');
const Utils = require('./Utils');

const _ = require('underscore');

module.exports = class LocalCommand {

	constructor(options){
		this._projectFolder = options.projectFolder;
	}

	initialize(){	

		const deploy_xml = new DeployXml({projectFolder: this._projectFolder});
		const objects = deploy_xml.getObjects();

		this.objects_path = deploy_xml.objects_path;
		this.files_path = deploy_xml.files_path;
		this.themes = objects.themes;
		this.extensions = objects.extensions;
	}

	getCommandQuestions(prompt){

		let extensions = Object.keys(this.extensions), themes = Object.keys(this.themes);
		let options = [
			{
				type: 'list',
				name: 'theme',
				message: Utils.translate('CHOOSE_THEME'),
				choices: this._validateTheme(themes)
			}
		];

		if (!_.isEmpty(extensions)) {
			options.push({
				type: 'checkbox',
				name: 'extensions',
				message: Utils.translate('CHOOSE_EXTENSION'),
				choices: extensions
			});
		}
		
		return prompt(options);
	}

	executeAction(answers){
		if(!answers.extensions || answers.extensions === true){
			answers.extensions = [];
		}
		const theme = answers.theme;		
		let extensionsList = Array.isArray(answers.extensions) ? answers.extensions : answers.extensions.split(',');
		const extensions = _.map(extensionsList, (extension)=>extension.trim())
		
		//Validate answers
		this._validateTheme(theme);
		this._validateExtensions(extensions);

		const context = this._createCompilationContext(theme, extensions);
		const compiler = new Compiler({context: context});
		const local_server = new LocalServer({context: context});

		return compiler.compile().then(_.bind(local_server.startServer, local_server));
	}

	_createCompilationContext(theme, extensions){
		return new CompilationContext({
			theme: theme,
			extensions: extensions,
			objects_path: this.objects_path,
			files_path: this.files_path,
			project_folder: this._projectFolder
		});
	}

	_validateTheme(theme){		
		if (_.isEqual(theme, [])) {
			throw Utils.translate('NO_THEMES', [this.objects_path]);
		}
		if(!this.themes[theme]){
			throw Utils.translate('THEME_NOT_FOUND', [theme, this.objects_path]);
		}

		return theme;
	}

	_validateExtensions(extensions){
		_.each(extensions, (extension) => {
			if(!this.extensions[extension]){
				throw Utils.translate('EXTENSION_NOT_FOUND', [extension, this.objects_path]);
			}
		});

		return extensions;
	}

};
