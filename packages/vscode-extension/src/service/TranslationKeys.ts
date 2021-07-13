/* eslint-disable @typescript-eslint/naming-convention */
/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

 export const ADD_DEPENDENCIES = {
	ADDED: 'ADD_DEPENDENCIES_ADDED',
	ADDED_LOG: 'ADD_DEPENDENCIES_ADDED_LOG',
	ADDING: 'ADD_DEPENDENCIES_ADDING',
	EMPTY: 'ADD_DEPENDENCIES_EMPTY',
	ERROR: 'ADD_DEPENDENCIES_ERROR',
};

export const ANSWERS = {
	CANCEL: 'ANSWERS_CANCEL',
	CONTINUE: 'ANSWERS_CONTINUE',
	NO: 'ANSWERS_NO',
	YES: 'ANSWERS_YES',
};

export const COMMAND = {
	ERROR: 'COMMAND_ERROR',
	SUCCESS: 'COMMAND_SUCCESS',
	TRIGGERED: 'COMMAND_TRIGGERED',
};

export const CREATE_PROJECT = {
	BUTTONS: {
		NEW_WINDOW: "CREATE_PROJECT_BUTTON_NEW_WINDOW",
		THIS_WINDOW: "CREATE_PROJECT_BUTTON_THIS_WINDOW",
	},
	MESSAGES: {
		CREATING_PROJECT: "CREATE_PROJECT_MESSAGE_CREATING_PROJECT",
		OPEN_PROJECT: "CREATE_PROJECT_MESSAGE_OPEN_PROJECT",
	},
	PROJECT_TYPE: {
		ACP: "CREATE_PROJECT_PROJECT_TYPE_ACP",
		SUITEAPP: "CREATE_PROJECT_PROJECT_TYPE_SUITEAPP",
	},
	QUESTIONS: {
		CHOOSE_PROJECT_TYPE: "CREATE_PROJECT_QUESTION_CHOOSE_PROJECT_TYPE",
		ENTER_PROJECT_ID: "CREATE_PROJECT_QUESTION_ENTER_PROJECT_ID",
		ENTER_PROJECT_NAME: "CREATE_PROJECT_QUESTION_ENTER_PROJECT_NAME",
		ENTER_PROJECT_VERSION: "CREATE_PROJECT_QUESTION_ENTER_PROJECT_VERSION",
		ENTER_PUBLISHER_ID: "CREATE_PROJECT_QUESTION_ENTER_PUBLISHER_ID",
		INCLUDE_UNIT_TESTING: "CREATE_PROJECT_QUESTION_INCLUDE_UNIT_TESTING",
		OVERWRITE_PROJECT: "CREATE_PROJECT_QUESTION_OVERWRITE_PROJECT",
	},
	SELECT_PARENT_FOLDER: "CREATE_PROJECT_SELECT_PARENT_FOLDER",
}

export const DEPLOY = {
	DEPLOYING: 'DEPLOY_DEPLOYING',
	QUESTIONS: {
		ACCOUNT_SPECIFIC_VALUES: 'DEPLOY_QUESTIONS_ACCOUNT_SPECIFIC_VALUES',
		APPLY_INSTALLATION_PREFERENCES: 'DEPLOY_QUESTIONS_APPLY_INSTALLATION_PREFERENCES',
	},
	QUESTIONS_CHOICES: {
		ACCOUNT_SPECIFIC_VALUES: {
			CANCEL_PROCESS: 'DEPLOY_QUESTIONS_CHOICES_ACCOUNT_SPECIFIC_VALUES_CANCEL_PROCESS',
			DISPLAY_WARNING: 'DEPLOY_QUESTIONS_CHOICES_ACCOUNT_SPECIFIC_VALUES_DISPLAY_WARNING',
		},
	},
};

export const DISMISS = 'DISMISS';

export const ERRORS = {
	NO_ACTIVE_FILE: 'ERRORS_NO_ACTIVE_FILE',
	NO_ACTIVE_WORKSPACE: 'ERRORS_NO_ACTIVE_WORKSPACE',
	SDK_JAVA_VERSION_NOT_COMPATIBLE: 'ERRORS_SDK_JAVA_VERSION_NOT_COMPATIBLE',
	SDK_JAVA_VERSION_NOT_INSTALLED: 'ERRORS_SDK_JAVA_VERSION_NOT_INSTALLED',
};

export const EXTENSION_INSTALLATION = {
	ERROR: {
		GENERAL_ERROR: 'EXTENSION_INSTALLATION_ERROR_GENERAL_ERROR',
		SDK_INVALID: 'EXTENSION_INSTALLATION_ERROR_SDK_INVALID',
		SDK_NOT_AVAILABLE: 'EXTENSION_INSTALLATION_ERROR_SDK_NOT_AVAILABLE',
	},
	IN_PROGRESS: 'EXTENSION_INSTALLATION_IN_PROGRESS',
	PROJECT_STARTUP: {
		BUTTONS: {
			RUN_SUITECLOUD_SETUP_ACCOUNT: "EXTENSION_PROJECT_STARTUP_BUTTON_RUN_SUITECLOUD_SETUP_ACCOUNT",
		},
		MESSAGES: {
			PROJECT_NEEDS_SETUP_ACCOUNT: "EXTENSION_PROJECT_STARTUP_MESSAGE_PROJECT_NEEDS_SETUP_ACCOUNT",
		},
	},
	SUCCESS: {
		SDK_DOWNLOADED: 'EXTENSION_INSTALLATION_SUCCESS_SDK_DOWNLOADED',
	},
};

export const IMPORT_FILES = {
	ERROR: 'IMPORT_FILES_ERROR',
	FINISHED: 'IMPORT_FILES_FINISHED',
	IMPORTING_FILE: 'IMPORT_FILES_IMPORTING_FILE',
	IMPORTING_FILES: 'IMPORT_FILES_IMPORTING_FILES',
	PROCESS_CANCELED: 'IMPORT_FILES_PROCESS_CANCELED',
	QUESTIONS: {
		CHOOSE_OPTION: 'IMPORT_FILES_QUESTIONS_CHOOSE_OPTION',
		EXCLUDE_PROPERTIES: 'IMPORT_FILES_QUESTIONS_EXCLUDE_PROPERTIES',
		SELECT_FILES: 'IMPORT_FILES_QUESTIONS_SELECT_FILES',
		OVERRIDE: 'IMPORT_FILES_QUESTIONS_OVERRIDE',
		OVERRIDE_SINGLE: 'IMPORT_FILES_QUESTIONS_OVERRIDE_SINGLE',
	},
};

export const LIST_FILES = {
	ERROR: {
		NO_FILES_FOUND: 'LIST_FILES_ERROR_NO_FILES_FOUND',
	},
	LISTING: 'LIST_FILES_LISTING',
	LOADING_FOLDERS: 'LIST_FILES_LOADING_FOLDERS',
	RESTRICTED_FOLDER: 'LIST_FILES_RESTRICTED_FOLDER',
	SELECT_FOLDER: 'LIST_FILES_SELECT_FOLDER',
};

export const LIST_OBJECTS = {
	LISTING: 'LIST_OBJECTS_LISTING',
};

export const MANAGE_ACCOUNTS = {
	AVAILABLE_CONNECTIONS: 'MANAGE_ACCOUNTS_AVAILABLE_CONNECTIONS',
	CANCELED: 'MANAGE_ACCOUNTS_CANCELED',
	CREATE: {
		BROWSER: 'MANAGE_ACCOUNTS_CREATE_BROWSER',
		BROWSER_CANCEL: 'MANAGE_ACCOUNTS_CREATE_BROWSER_CANCEL',
		CONTINUE_IN_BROWSER: 'MANAGE_ACCOUNTS_CREATE_CONTINUE_IN_BROWSER',
		ENTER_AUTH_ID: 'MANAGE_ACCOUNTS_ENTER_AUTH_ID',
		ENTER_URL: 'MANAGE_ACCOUNTS_ENTER_URL',
		NEW_AUTHID: 'MANAGE_ACCOUNTS_CREATE_NEW_AUTHID',
		SAVE_TOKEN: {
			ENTER_ACCOUNT_ID: 'MANAGE_ACCOUNTS_SAVE_TOKEN_ENTER_ACCOUNT_ID',
			ENTER_TOKEN_ID: 'MANAGE_ACCOUNTS_SAVE_TOKEN_ENTER_TOKEN_ID',
			ENTER_TOKEN_SECRET: 'MANAGE_ACCOUNTS_SAVE_TOKEN_ENTER_TOKEN_SECRET',
			OPTION: 'MANAGE_ACCOUNTS_CREATE_SAVE_TOKEN_OPTION',
			SAVING_TBA: 'MANAGE_ACCOUNTS_CREATE_SAVE_TOKEN_SAVING_TBA',
			SUCCESS: {
				NEW_TBA: 'MANAGE_ACCOUNTS_CREATE_SAVE_TOKEN_NEW_TBA',
			},
		},
	},
	CREATE_NEW: 'MANAGE_ACCOUNTS_CREATE_NEW',
	ERROR: {
		MISSING_MANIFEST: 'MANAGE_ACCOUNTS_ERROR_MISSING_MANIFEST',
		NOT_IN_PROJECT: 'MANAGE_ACCOUNTS_ERROR_NOT_IN_PROJECT',
	},
	LOADING: 'MANAGE_ACCOUNTS_LOADING',
	SELECT_AUTH_ID: {
		SUCCESS: 'MANAGE_ACCOUNTS_SELECT_AUTH_ID_SUCCESS',
	},
	SELECT_CREATE: 'MANAGE_ACCOUNTS_SELECT_CREATE',
};

export const SEE_DETAILS = 'SEE_DETAILS';

export const UPLOAD_FILE = {
	ERROR: {
		UPLOAD_FILE_FOLDER_RESTRICTION: 'UPLOAD_FILE_ERROR_UPLOAD_FILE_FOLDER_RESTRICTION',
	},
	OVERWRITE_QUESTION: 'UPLOAD_FILE_OVERWRITE_FILE',
	PROCESS_CANCELED: 'UPLOAD_FILE_PROCESS_CANCELED',
	UPLOADING: 'UPLOAD_FILE_UPLOADING',
};

export const UPDATE_OBJECT = {
	ERROR: {
		SDF_OBJECT_MUST_BE_IN_OBJECTS_FOLDER: 'UPDATE_OBJECT_ERROR_SDF_OBJECT_MUST_BE_IN_OBJECTS_FOLDER',
	},
	OVERRIDE: 'UPDATE_OBJECT_OVERRIDE',
	PROCESS_CANCELED: 'UPDATE_OBJECT_PROCESS_CANCELED',
	UPDATING: 'UPDATE_OBJECT_UPDATING',
};
