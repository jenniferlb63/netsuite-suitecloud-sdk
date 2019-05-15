'use strict';
const NodeUtils = require('../utils/NodeUtils');
const TranslationService = require('../services/TranslationService');
const { ERRORS } = require('../services/TranslationKeys');

const VALIDATION_RESULT_FAILURE = validationError => ({
	result: false,
	validationMessage: validationError,
});
const VALIDATION_RESULT_SUCCESS = { result: true };

NodeUtils.formatString(TranslationService.getMessage(ERRORS.EMPTY_FIELD), {
	color: NodeUtils.COLORS.ERROR,
	bold: true,
});

const ALPHANUMERIC_LOWERCASE_REGEX = '[a-z0-9]+';
const ALPHANUMERIC_LOWERCASE_WHOLE_REGEX = '^' + ALPHANUMERIC_LOWERCASE_REGEX + '$';
const SCRIPT_ID_REGEX = /^[a-z0-9_]+$/;
const STRING_WITH_SPACES_REGEX = /\s/;

const PROJECT_VERSION_FORMAT_REGEX = '^\\d(\\.\\d){2}$';
const SUITEAPP_ID_FORMAT_REGEX =
	'^' + ALPHANUMERIC_LOWERCASE_REGEX + '(\\.' + ALPHANUMERIC_LOWERCASE_REGEX + '){2}$';
const SUITEAPP_PUBLISHER_ID_FORMAT_REGEX = 
	'^' + ALPHANUMERIC_LOWERCASE_REGEX + '\\.' + ALPHANUMERIC_LOWERCASE_REGEX + '$';

class InteractiveAnswersValidator {
	showValidationResults(value, ...funcs) {
		var i;
		for (i = 0; i < funcs.length; i++) {
			var func = funcs[i];
			const validationOutput = func(value);
			if (!validationOutput.result) {
				return NodeUtils.formatString(validationOutput.validationMessage, {
					color: NodeUtils.COLORS.ERROR,
					bold: true,
				});
			}
		}
		return true;
	}

	validateFieldIsNotEmpty(fieldValue) {
		return fieldValue !== ''
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.EMPTY_FIELD));
	}

	validateFieldHasNoSpaces(fieldValue) {
		return !STRING_WITH_SPACES_REGEX.test(fieldValue)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.FIELD_HAS_SPACES));
	}

	validateFieldIsLowerCase(fieldValue) {
		return fieldValue.match(ALPHANUMERIC_LOWERCASE_WHOLE_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.FIELD_NOT_LOWER_CASE));
	}

	validatePublisherId(fieldValue) {
		return fieldValue.match(SUITEAPP_PUBLISHER_ID_FORMAT_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.PUBLISHER_ID_FORMAT));
	}

	validateProjectVersion(fieldValue) {
		return fieldValue.match(PROJECT_VERSION_FORMAT_REGEX)
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.PROJECT_VERSION_FORMAT));
	}

	validateArrayIsNotEmpty(array) {
		return array.length > 0
			? VALIDATION_RESULT_SUCCESS
			: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.CHOOSE_OPTION));
	}

	validateSuiteApp(fieldValue) {
		let notEmpty =
			fieldValue !== ''
				? VALIDATION_RESULT_SUCCESS
				: VALIDATION_RESULT_FAILURE(
						TranslationService.getMessage(ERRORS.EMPTY_FIELD)
				  );

		if (notEmpty.result != true) {
			return notEmpty;
		} else if (!fieldValue.match(SUITEAPP_ID_FORMAT_REGEX)) {
			return VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.APP_ID_FORMAT));
		}
		return VALIDATION_RESULT_SUCCESS;
	}

	validateScriptId(fieldValue) {
		let notEmpty =
			fieldValue !== ''
				? VALIDATION_RESULT_SUCCESS
				: VALIDATION_RESULT_FAILURE(TranslationService.getMessage(ERRORS.EMPTY_FIELD));

		if (notEmpty.result != true) {
			return notEmpty;
		} else if (!fieldValue.match(SCRIPT_ID_REGEX)) {
			return VALIDATION_RESULT_FAILURE(
				TranslationService.getMessage(ERRORS.SCRIPT_ID_FORMAT)
			);
		}
		return VALIDATION_RESULT_SUCCESS;
	}
}

module.exports = new InteractiveAnswersValidator();
