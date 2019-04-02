'use strict';

const { ERRORS } = require('../services/TranslationKeys');
const { MANIFEST_XML } = require('../ApplicationConstants');
const { PROJECT_SUITEAPP, PROJECT_ACP } = require('../ApplicationConstants');
const CLIException = require('../CLIException');
const FileUtils = require('../utils/FileUtils');
const path = require('path');
const TranslationService = require('../services/TranslationService');
const xml2js = require('xml2js');
const MANIFEST_TAG_XML_PATH = '/manifest';
const MANIFEST_XML_DEFINITIONS = {
	ATTRIBUTES: {
		PROJECT_TYPE: 'projecttype',
	},
	TAGS: {
		MANIFEST: 'manifest',
	},
};


module.exports = class ProjectMetadataService {

	/**
	 * This validation function has to be defined in xml2js.Parser in the "validator" option
	 * When calling parserString this function will be executed for every tag of the xml we are
	 * parsing.
	 * @param {*} xmlPath Path of the tag that it's being evaluated at the current moment.
	 * @param {*} previousValue Existing value at this path if there is already one (e.g. this 
	 * 								  is the second or later item in an array).
	 * @param {*} newValue Value of the tag that it's being evaluated at the current moment.
	 * @throws ValidationError if the validation fails
	 */
	_validateXml(xmlPath, previousValue, newValue) {
		//TODO Add more cases
		if (xmlPath === MANIFEST_TAG_XML_PATH) {
			let manifestTagAttributes = newValue['$'];
			if (!manifestTagAttributes || !manifestTagAttributes[MANIFEST_XML_DEFINITIONS.ATTRIBUTES.PROJECT_TYPE]) {
				throw new xml2js.ValidationError(
					TranslationService.getMessage(ERRORS.XML_PROJECTTYPE_ATTRIBUTE_MISSING)
				);
			} else if (
				manifestTagAttributes[MANIFEST_XML_DEFINITIONS.ATTRIBUTES.PROJECT_TYPE] !== PROJECT_SUITEAPP
				&& manifestTagAttributes[MANIFEST_XML_DEFINITIONS.ATTRIBUTES.PROJECT_TYPE] !== PROJECT_ACP
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
		if (manifestString.substr(0, beginTag.length) != beginTag) {
			throw new CLIException(
				-10,
				TranslationService.getMessage(ERRORS.PROCESS_FAILED) + ' ' +
					TranslationService.getMessage(ERRORS.XML_MANIFEST_TAG_MISSING)
			);
		}
		let projectType;
		let errorValidation;

		let parser = new xml2js.Parser({ validator: this._validateXml });

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
