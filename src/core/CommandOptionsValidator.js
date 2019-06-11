'use strict';
const TranslationService = require('../services/TranslationService');
const TRANSLATION_KEYS = require('../services/TranslationKeys');
const { lineBreak } = require('../utils/NodeUtils');
const assert = require('assert');

module.exports = class CommandOptionsValidator {
	validate(options) {
		assert(options);
		assert(options.commandOptions);
		assert(options.arguments);

		const validationErrors = [];

		const isMandatoryOptionPresent = (optionId, aliasId, args) => {
			return args[optionId] || args[aliasId];
		};

		for (const optionId in options.commandOptions) {
			const option = options.commandOptions[optionId];
			const aliasId = option.alias;
			if (options.commandOptions.hasOwnProperty(optionId)) {
				if (option.mandatory && !isMandatoryOptionPresent(optionId, aliasId, options.arguments)) {
					validationErrors.push(
						TranslationService.getMessage(
							TRANSLATION_KEYS.COMMAND_OPTION_IS_MANDATORY,
							option.name
						)
					);
				}
			}
		}
		return validationErrors;
	}

	formatErrors(validationErrors) {
		assert(validationErrors);
		assert(Array.isArray(validationErrors));

		var errorMessageHeader = TranslationService.getMessage(
			TRANSLATION_KEYS.COMMAND_OPTIONS_VALIDATION_ERRORS
		);
		var valiationErrorsString = validationErrors.join(lineBreak);
		return `${errorMessageHeader}${lineBreak}${valiationErrorsString}`;
	}
};