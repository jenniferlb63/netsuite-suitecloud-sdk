'use strict';

module.exports = {
	ANSWERS_VALIDATION_MESSAGES: {
		APP_ID_FORMAT: 'ANSWERS_VALIDATION_MESSAGES_APP_ID_FORMAT',
		CHOOSE_OPTION: 'ANSWERS_VALIDATION_MESSAGES_CHOOSE_OPTION',
		EMPTY_FIELD: 'ANSWERS_VALIDATION_MESSAGES_EMPTY_FIELD',
		FIELD_HAS_SPACES: 'ANSWERS_VALIDATION_MESSAGES_FIELD_HAS_SPACES',
		FIELD_NOT_LOWER_CASE: 'ANSWERS_VALIDATION_MESSAGES_FIELD_NOT_LOWER_CASE',
		INVALID_EMAIL: 'ANSWERS_VALIDATION_MESSAGES_INVALID_EMAIL',
		PROJECT_VERSION_FORMAT: 'ANSWERS_VALIDATION_MESSAGES_PROJECT_VERSION_FORMAT',
		PUBLISHER_ID_FORMAT: 'ANSWERS_VALIDATION_MESSAGES_PUBLISHER_ID_FORMAT',
		SCRIPT_ID_FORMAT: 'ANSWERS_VALIDATION_MESSAGES_SCRIPT_ID_FORMAT',
		FIELD_HAS_XML_FORBIDDEN_CHARACTERS:
			'ANSWERS_VALIDATION_MESSAGES_FIELD_HAS_XML_FORBIDDEN_CHARACTERS',
	},
	CLI_TITLE: 'CLI_TITLE',
	COMMAND_ADDDEPENDENCIES: {
		MESSAGES: {
			ADDING_DEPENDENCIES: 'COMMAND_ADDDEPENDENCIES_MESSAGE_ADDING_DEPENDENCIES',
			NO_UNRESOLVED_DEPENDENCIES:
				'COMMAND_ADDDEPENDENCIES_MESSAGE_NO_UNRESOLVED_DEPENDENCIES',
			DEPENDENCIES_ADDED_TO_MANIFEST:
				'COMMAND_ADDDEPENDENCIES_MESSAGE_DEPENDENCIES_ADDED_TO_MANIFEST',
		},
	},
	COMMAND_CREATEPROJECT: {
		QUESTIONS: {
			CHOOSE_PROJECT_TYPE: 'COMMAND_CREATEPROJECT_CHOOSE_PROJECT_TYPE',
			ENTER_PROJECT_NAME: 'COMMAND_CREATEPROJECT_ENTER_PROJECT_NAME',
			OVERWRITE_PROJECT: 'COMMAND_CREATEPROJECT_OVERWRITE_PROJECT',
			ENTER_PUBLISHER_ID: 'COMMAND_CREATEPROJECT_ENTER_PUBLISHER_ID',
			ENTER_PROJECT_ID: 'COMMAND_CREATEPROJECT_ENTER_PROJECT_ID',
			ENTER_PROJECT_VERSION: 'COMMAND_CREATEPROJECT_ENTER_PROJECT_VERSION',
		},
		MESSAGES: {
			CREATING_PROJECT: 'COMMAND_CREATEPROJECT_MESSAGE_CREATING_PROJECT',
			PROJECT_CREATED: 'COMMAND_CREATEPROJECT_MESSAGE_PROJECT_CREATED',
			PROJECT_CREATION_CANCELED: 'COMMAND_CREATEPROJECT_MESSAGE_PROJECT_CREATION_CANCELED',
			PROCESS_FAILED: 'COMMAND_CREATEPROJECT_ERRORS_PROCESS_FAILED',
		},
	},
	COMMAND_IMPORTFILES: {
		ERRORS: {
			INTERNAL: 'COMMAND_IMPORTFILES_ERRORS_INTERNAL',
			IS_SUITEAPP: 'COMMAND_IMPORTFILES_ERRORS_IS_SUITEAPP',
		},
		QUESTIONS: {
			EXCLUDE_PROPERTIES: 'COMMAND_IMPORTFILES_QUESTIONS_EXCLUDE_PROPERTIES',
			OVERWRITE_FILES: 'COMMAND_IMPORTFILES_QUESTIONS_OVERWRITE_FILES',
			SELECT_FILES: 'COMMAND_IMPORTFILES_QUESTIONS_SELECT_FILES',
			SELECT_FOLDER: 'COMMAND_IMPORTFILES_QUESTIONS_SELECT_FOLDER',
		},
		MESSAGES: {
			CANCEL_IMPORT: 'COMMAND_IMPORTOFILES_MESSAGES_CANCEL_IMPORT',
			IMPORTING_FILES: 'COMMAND_IMPORTFILES_MESSAGES_IMPORTING_FILES',
			LOADING_FILES: 'COMMAND_IMPORTFILES_MESSAGES_LOADING_FILES',
			LOADING_FOLDERS: 'COMMAND_IMPORTFILES_MESSAGES_LOADING_FOLDERS',
			RESTRICTED_FOLDER: 'COMMAND_IMPORTFILES_MESSAGES_RESTRICTED_FOLDER',
		},
		OUTPUT: {
			FILES_IMPORTED: 'COMMAND_IMPORTFILES_OUTPUT_FILES_IMPORTED',
			FILES_NOT_IMPORTED: 'COMMAND_IMPORTFILES_OUTPUT_FILES_NOT_IMPORTED',
		},
	},
	COMMAND_IMPORTOBJECTS: {
		ERRORS: {
			CALLING_LIST_OBJECTS: 'COMMAND_IMPORTOBJECTS_ERRORS_COMMAND_IMPORTOBJECTS',
			PROCESS_FAILED: 'COMMAND_IMPORTOBJECTS_ERRORS_PROCESS_FAILED',
		},
		QUESTIONS: {
			APPID: 'COMMAND_IMPORTOBJECTS_QUESTIONS_APPID',
			FILTER_BY_CUSTOM_OBJECTS: 'COMMAND_IMPORTOBJECTS_QUESTIONS_FILTER_BY_CUSTOM_OBJECTS',
			FILTER_BY_SCRIPT_ID: 'COMMAND_IMPORTOBJECTS_QUESTIONS_FILTER_BY_SCRIPT_ID',
			SCRIPT_ID: 'COMMAND_IMPORTOBJECTS_QUESTIONS_SCRIPT_ID',
			SHOW_ALL_CUSTOM_OBJECTS: 'COMMAND_IMPORTOBJECTS_QUESTIONS_SHOW_ALL_CUSTOM_OBJECTS',
			SPECIFIC_APPID: 'COMMAND_IMPORTOBJECTS_QUESTIONS_SPECIFIC_APPID',
			DESTINATION_FOLDER: 'COMMAND_IMPORTOBJECTS_QUESTIONS_DESTINATION_FOLDER',
			OVERRITE_OBJECTS: 'COMMAND_IMPORTOBJECTS_QUESTIONS_OVERRITE_OBJECTS',
			SELECT_OBJECTS: 'COMMAND_IMPORTOBJECTS_QUESTIONS_SELECT_OBJECTS',
		},
		MESSAGES: {
			LOADING_OBJECTS: 'COMMAND_IMPORTOBJECTS_MESSAGES_LOADING_OBJECTS',
			CANCEL_IMPORT: 'COMMAND_IMPORTOBJECTS_MESSAGES_CANCEL_IMPORT',
			NO_OBJECTS_TO_LIST: 'COMMAND_IMPORTOBJECTS_MESSAGES_NO_OBJECTS_TO_LIST',
			IMPORTING_OBJECTS: 'COMMAND_IMPORTOBJECTS_MESSAGES_IMPORTING_OBJECTS',
			IMPORTED_OBJECTS: 'COMMAND_IMPORTOBJECTS_MESSAGES_IMPORTED_OBJECTS',
			UNIMPORTED_OBJECTS: 'COMMAND_IMPORTOBJECTS_MESSAGES_UNIMPORTED_OBJECTS',
		},
	},
	COMMAND_LISTFILES: {
		ERROR_INTERNAL: 'COMMAND_LISTFILES_ERROR',
		LOADING_FILES: 'COMMAND_LISTFILES_LOADING_FILES',
		LOADING_FOLDERS: 'COMMAND_LISTFILES_LOADING_FOLDERS',
		RESTRICTED_FOLDER: 'COMMAND_LISTFILES_RESTRICTED_FOLDER',
		SELECT_FOLDER: 'COMMAND_LISTFILES_SELECT_FOLDER',
	},
	COMMAND_LISTOBJECTS: {
		LISTING_OBJECTS: 'COMMAND_LISTOBJECTS_LISTING_OBJECTS',
		QUESTIONS: {
			APPID: 'COMMAND_LISTOBJECTS_QUESTIONS_APPID',
			FILTER_BY_CUSTOM_OBJECTS: 'COMMAND_LISTOBJECTS_QUESTIONS_FILTER_BY_CUSTOM_OBJECTS',
			FILTER_BY_SCRIPT_ID: 'COMMAND_LISTOBJECTS_QUESTIONS_FILTER_BY_SCRIPT_ID',
			SCRIPT_ID: 'COMMAND_LISTOBJECTS_QUESTIONS_SCRIPT_ID',
			SHOW_ALL_CUSTOM_OBJECTS: 'COMMAND_LISTOBJECTS_QUESTIONS_SHOW_ALL_CUSTOM_OBJECTS',
			SPECIFIC_APPID: 'COMMAND_LISTOBJECTS_QUESTIONS_SPECIFIC_APPID',
		},
		SUCCESS_OBJECTS_IMPORTED: 'COMMAND_LISTOBJECTS_SUCCESS_OBJECTS_IMPORTED',
		SUCCESS_NO_OBJECTS: 'COMMAND_LISTOBJECTS_SUCCESS_NO_OBJECTS',
	},
	COMMAND_LOCAL: {
		COMPILATION_START: 'COMMAND_LOCAL_COMPILATION_START',
		COMPILATION_START_FOR: 'COMMAND_LOCAL_COMPILATION_START_FOR',
		COMPILATION_FINISH: 'COMMAND_LOCAL_COMPILATION_FINISH',
		COMPILATION_FINISH_FOR: 'COMMAND_LOCAL_COMPILATION_FINISH_FOR',
		SERVER: 'COMMAND_LOCAL_SERVER',
		WATCH: 'COMMAND_LOCAL_WATCH',
		SSP_LOCAL_FILES_INFO: 'COMMAND_LOCAL_SSP_LOCAL_FILES_INFO',
		CANCEL_ACTION: 'COMMAND_LOCAL_CANCEL_ACTION',
		CHOOSE_THEME: 'COMMAND_LOCAL_CHOOSE_THEME',
		CHOOSE_EXTENSION: 'COMMAND_LOCAL_CHOOSE_EXTENSION',
		OVERRIDE: 'COMMAND_LOCAL_OVERRIDE',
		NO_THEMES: 'COMMAND_LOCAL_NO_THEMES',
		RESOURCE_NOT_FOUND: 'COMMAND_LOCAL_RESOURCE_NOT_FOUND',
		THEME_NOT_FOUND: 'COMMAND_LOCAL_THEME_NOT_FOUND',
		EXTENSION_NOT_FOUND: 'COMMAND_LOCAL_EXTENSION_NOT_FOUND',
		INVALID_XML: 'COMMAND_LOCAL_INVALID_XML',
	},
	COMMAND_OPTION_INTERACTIVE_HELP: 'COMMAND_OPTION_INTERACTIVE_HELP',
	COMMAND_OPTION_IS_MANDATORY: 'COMMAND_OPTION_IS_MANDATORY',
	COMMAND_OPTIONS_VALIDATION_ERRORS: 'COMMAND_OPTIONS_VALIDATION_ERRORS',

	COMMAND_PROXY: {
		ARGS_VALIDATION: {
			SET_CLEAR_BOTH_SPECIFIED: 'COMMAND_PROXY_ARGS_VALIDATION_SET_CLEAR_BOTH_SPECIFIED',
			SET_CLEAR_NEITHER_SPECIFIED:
				'COMMAND_PROXY_ARGS_VALIDATION_SET_CLEAR_NEITHER_SPECIFIED',
			PROXY_URL: 'COMMAND_PROXY_ARGS_VALIDATION_PROXY_URL',
		},
		MESSAGES: {
			PROXY_OVERRIDDEN: 'COMMAND_PROXY_MESSAGES_PROXY_OVERRIDDEN',
			SUCCESFULLY_CLEARED: 'COMMAND_PROXY_MESSAGES_SUCCESFULLY_CLEARED',
			SUCCESFULLY_SETUP: 'COMMAND_PROXY_MESSAGES_SUCCESFULLY_SETUP',
		},
	},

	COMMAND_SETUPACCOUNT: {
		ERRORS: {
			NOT_PROJECT_FOLDER: 'COMMAND_SETUPACCOUNT_ERRORS_NOT_PROJECT_FOLDER',
		},
		QUESTIONS: {
			OVERWRITE_ACCOUNT_DETAILS_FILE:
				'COMMAND_SETUPACCOUNT_QUESTIONS_OVERWRITE_ACCOUNT_DETAILS_FILE',
			USE_PRODUCTION_DOMAIN: 'COMMAND_SETUPACCOUNT_QUESTIONS_USE_PRODUCTION_DOMAIN',
			DOMAIN_URL: 'COMMAND_SETUPACCOUNT_QUESTIONS_DOMAIN_URL',
			EMAIL: 'COMMAND_SETUPACCOUNT_QUESTIONS_EMAIL',
			PASSWORD: 'COMMAND_SETUPACCOUNT_QUESTIONS_PASSWORD',
			COMPANY_ID: 'COMMAND_SETUPACCOUNT_QUESTIONS_COMPANY_ID',
			ROLE: 'COMMAND_SETUPACCOUNT_QUESTIONS_ROLE',
			ISSUE_A_TOKEN: 'COMMAND_SETUPACCOUNT_QUESTIONS_ISSUE_A_TOKEN',
			ISSUE_TOKEN_OPTION: 'COMMAND_SETUPACCOUNT_QUESTIONS_ISSUE_TOKEN_OPTION',
			SAVE_TOKEN_OPTION: 'COMMAND_SETUPACCOUNT_QUESTIONS_SAVE_TOKEN_OPTION',
			SAVE_TOKEN_ID: 'COMMAND_SETUPACCOUNT_QUESTIONS_SAVE_TOKEN_ID',
			SAVE_TOKEN_SECRET: 'COMMAND_SETUPACCOUNT_QUESTIONS_SAVE_TOKEN_SECRET',
		},
		MESSAGES: {
			ISSUING_TBA_TOKEN: 'COMMAND_SETUPACCOUNT_MESSAGES_ISSUING_TBA_TOKEN',
			CANCEL_SETUP: 'COMMAND_SETUPACCOUNT_MESSAGES_CANCEL_SETUP',
			RETRIEVING_ACCOUNT_INFO: 'COMMAND_SETUPACCOUNT_MESSAGES_RETRIEVING_ACCOUNT_INFO',
			SAVING_TBA_TOKEN: 'COMMAND_SETUPACCOUNT_MESSAGES_SAVING_TBA_TOKEN',
		},
		OUTPUT: {
			SUCCESSFUL: 'COMMAND_SETUPACCOUNT_OUTPUT_SUCCESSFUL',
		},
	},
	COMMAND_SDK_WRAPPER: {
		MESSAGES: {
			EXECUTING_COMMAND: 'COMMAND_SDK_WRAPPER_EXECUTING_COMMAND',
		},
	},
	ERRORS: {
		ACCOUNT_DETAILS_FILE_CONTENT: 'ERRORS_ACCOUNT_DETAILS_FILE_CONTENT',
		CLI_CONFIG_BEFORE_EXECUTING_FAILED: 'ERRORS_CLI_CONFIG_BEFORE_EXECUTING_FAILED',
		CLI_CONFIG_BEFORE_EXECUTING_WRONG_RETURN_VALUE:
			'ERRORS_CLI_CONFIG_BEFORE_EXECUTING_WRONG_RETURN_VALUE',
		CLI_CONFIG_ERROR_LOADING_CONFIGURATION_MODULE:
			'ERRORS_CLI_CONFIG_ERROR_LOADING_CONFIGURATION_MODULE',
		COMMAND_DOES_NOT_EXIST: 'ERRORS_COMMAND_DOES_NOT_EXIST',
		COMMAND_DOES_NOT_SUPPORT_INTERACTIVE_MODE:
			'ERRORS_COMMAND_DOES_NOT_SUPPORT_INTERACTIVE_MODE',
		FILE: 'ERRORS_FILE',
		FILE_NOT_EXIST: 'ERRORS_FILE_NOT_EXIST',
		GENERAL_CONNECTION_PROBLEM: 'ERRORS_GENERAL_CONNECTION_PROBLEM',
		NO_OBJECTS: 'ERRORS_NO_OBJECTS',
		PROCESS_FAILED: 'ERRORS_PROCESS_FAILED',
		PROMPTING_INTERACTIVE_QUESTIONS_FAILED: 'ERRORS_PROMPTING_INTERACTIVE_QUESTIONS_FAILED',
		SDKEXECUTOR: {
			AUTHENTICATION: 'ERRORS_SDKEXECUTOR_AUTHENTICATION',
			RUNNING_COMMAND: 'ERRORS_SDKEXECUTOR_RUNNING_COMMAND',
			SDK_ERROR: 'ERRORS_SDKEXECUTOR_SDK_ERROR',
		},
		SETUP_REQUIRED: 'ERRORS_SETUP_REQUIRED',
		SETUP_VALID_FOLDER: 'ERRORS_SETUP_VALID_FOLDER',
		TIMED_OUT_CONNECTION: 'ERRORS_TIMED_OUT_CONNECTION',
		XML_MANIFEST_TAG_MISSING: 'ERRORS_XML_MANIFEST_TAG_MISSING',
		XML_PROJECTTYPE_ATTRIBUTE_MISSING: 'ERRORS_XML_PROJECTTYPE_ATTRIBUTE_MISSING',
		XML_PROJECTTYPE_INCORRECT: 'ERRORS_XML_PROJECTTYPE_INCORRECT',
		WRITING_ACCOUNT_JSON: 'ERRORS_WRITING_ACCOUNT_JSON',
		WRONG_PROXY_SETTING: 'ERRORS_WRONG_PROXY_SETTING',
	},
	INTERACTIVE_OPTION_DESCRIPTION: 'INTERACTIVE_OPTION_DESCRIPTION',
	NO: 'NO',
	YES: 'YES',
};
