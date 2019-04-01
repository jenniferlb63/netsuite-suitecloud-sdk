'use strict';

const { ERRORS } = require('../services/TranslationKeys');
const { MANIFEST_XML, MANIFEST_XML_DEFINITIONS } = require('../ApplicationConstants');
const { PROJECT_SUITEAPP, PROJECT_ACP } = require('../ApplicationConstants');
const CLIException = require('../CLIException');
const FileUtils = require('../utils/FileUtils');
const path = require('path');
const TranslationService = require('../services/TranslationService');
const xml2js = require('xml2js');

module.exports = class ProjectMetadataService {
	_validate_xml(key, currentValue, newValue) {
		//TODO Add more cases
		if (key === '/manifest') {
			if (!newValue['$'] || !newValue['$'][MANIFEST_XML_DEFINITIONS.ATTRIBUTES.PROJECT_TYPE]) {
				throw new xml2js.ValidationError(
					TranslationService.getMessage(ERRORS.XML_PROJECTTYPE_ATTRIBUTE_MISSING)
				);
			} else if (
				newValue['$'][MANIFEST_XML_DEFINITIONS.ATTRIBUTES.PROJECT_TYPE] !== PROJECT_SUITEAPP &&
				newValue['$'][MANIFEST_XML_DEFINITIONS.ATTRIBUTES.PROJECT_TYPE] !== PROJECT_ACP
			) {
				throw new xml2js.ValidationError(
					TranslationService.getMessage(ERRORS.XML_PROJECTTYPE_INCORRECT)
				);
			}
		}
		return newValue;
	}

	getProjectType(projectFolder) {
		const manifestPath = path.join(projectFolder, MANIFEST_XML);
		if (!FileUtils.exists(manifestPath))
			throw new CLIException(
				-10,
				TranslationService.getMessage(ERRORS.PROCESS_FAILED) + ' ' +
					TranslationService.getMessage(ERRORS.FILE_NOT_EXIST, manifestPath)
			);

		const manifestString = FileUtils.readAsString(manifestPath);
		const beginTag = '<' + MANIFEST_XML_DEFINITIONS.TAGS.MANIFEST;
		if (!manifestString.substr(0, beginTag.length) === beginTag) {
			if (!result.manifest) {
				throw new CLIException(
					-10,
					TranslationService.getMessage(ERRORS.PROCESS_FAILED) + ' ' +
						TranslationService.getMessage(ERRORS.XML_MANIFEST_TAG_MISSING)
				);
			}
		}
		let projectType = '';
		let errorValidation;

		let parser = new xml2js.Parser({ validator: this._validate_xml });

		parser.parseString(manifestString, function(err, result) {
			if (err) {
				errorValidation =
					TranslationService.getMessage(ERRORS.PROCESS_FAILED) + ' ' +
					TranslationService.getMessage(ERRORS.FILE, manifestPath) +
					err;
			}

			if (result) {
				projectType = result.manifest.$.projecttype;
			}
		});

		//TODO CHECK XML IS VALID

		if (errorValidation) {
			throw new CLIException(-10, errorValidation);
		}

		return projectType;
	}
};
