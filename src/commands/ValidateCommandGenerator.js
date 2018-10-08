'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const inquirer = require('inquirer');

const COMMAND_NAME = 'validate';
const COMMAND_ALIAS = 'v';
const COMMAND_DESCRIPTION = 'Validate the folder or zip file containing the project.';
const IS_SETUP_REQUIRED = true;

module.exports = class ValidateCommandGenerator extends BaseCommandGenerator {

    constructor() {
        super(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, IS_SETUP_REQUIRED);
    }

    _getCommandQuestions() {
        return [
            {
                type: 'input',
                name: 'project',
                message: 'Please specify project folder',
            },
            {
                type: 'list',
                name: 'server',
                message: 'Would you like to perform validation server side?',
                default: 0,
                choices: [
                    {
                        name: 'Yes',
                        value: true
                    },
                    {
                        name: 'No',
                        value: false
                    }
                ]
            },
            {
                type: 'input',
                name: 'log',
                default: '',
                message: 'Please set validation log file location as either a directory or a file name.'
            },
            {
                type: 'list',
                name: 'accountspecificvalues',
                message: 'Would you like to flag account-specific values as an error or a warning?',
                default: 0,
                choices: [
                    {
                        name: 'Flag as an error',
                        value: 'ERROR'
                    },
                    {
                        name: 'Flag as a warning',
                        value: 'WARNING'
                    }
                ]
            },
            {
                type: 'list',
                name: 'applycontentprotection',
                message: 'Would you like to apply content protection?',
                default: 0,
                choices: [
                    {
                        name: 'No',
                        value: false
                    },
                    {
                        name: 'Yes',
                        value: true
                    }
                ]
            },
        ]
    }

    _executeAction() {
        inquirer.prompt(this._getCommandQuestions()).then(answers => {
            var currentProjectPath = process.cwd();
            var logPath = answers.log ? answers.log : currentProjectPath;
            
            let params = {
                '-project': currentProjectPath,
                '-log': logPath,
                ...(answers.accountspecificvalues === 'WARNING' && {'-accountspecificvalues': answers.accountspecificvalues}),
                ...(answers.applycontentprotection && {'-applycontentprotection': 'T'}),
                ...(answers.server && {'-server': ''}),
            };
            let executionContext = new SDKExecutionContext(COMMAND_NAME, params, true);
            this._sdkExecutor.execute(executionContext);
        });
    }

};