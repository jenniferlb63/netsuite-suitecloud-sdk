/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import { ERRORS, ANSWERS, UPDATE_OBJECT, COMMAND } from '../service/TranslationKeys';
import { ProjectInfoService, actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { ValidationResult } from '../types/ActionResult';
import { FOLDERS } from '../ApplicationConstants';

const COMMAND_NAME = 'updateobject';
const STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
};

export default class UpdateObject extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		if (!this.activeFile) {
			// Already checked in validateBeforeExecute
			return;
		}

		const scriptId = path.basename(this.activeFile, '.xml');

		const continueMessage = this.translationService.getMessage(ANSWERS.CONTINUE);
		const cancelMessage = this.translationService.getMessage(ANSWERS.CANCEL);
		const override = await window.showQuickPick([continueMessage, cancelMessage], {
			placeHolder: this.translationService.getMessage(UPDATE_OBJECT.OVERRIDE, scriptId),
			canPickMany: false,
		});

		if (!override || override === this.translationService.getMessage(ANSWERS.CANCEL)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(UPDATE_OBJECT.PROCESS_CANCELED));
			return;
		}

		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage = this.translationService.getMessage(UPDATE_OBJECT.UPDATING);
		const commandActionPromise = this.runSuiteCloudCommand({ scriptid: [scriptId] });
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data.length === 1 && actionResult.data[0].type === STATUS.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
		return;
	}

	protected validateBeforeExecute(): ValidationResult {
		const superValidation = super.validateBeforeExecute();
		if (!superValidation.valid) {
			return superValidation;
		}
		if (!this.activeFile) {
			// Already performed at super.validateBeforeExecute(), needed to avoid TypeScript
			return this.unsuccessfulValidation(this.translationService.getMessage(ERRORS.NO_ACTIVE_FILE));
		}
		const projectFolderPath = this.getProjectFolderPath();
		const projectInfoService = new ProjectInfoService(projectFolderPath);
		try {
			if (projectInfoService.isAccountCustomizationProject() || projectInfoService.isSuiteAppProject()) {
				const relativePath = path.relative(projectFolderPath, this.activeFile);
				if (!relativePath.startsWith(FOLDERS.OBJECTS + path.sep)) {
					return this.unsuccessfulValidation(this.translationService.getMessage(UPDATE_OBJECT.ERROR.SDF_OBJECT_MUST_BE_IN_OBJECTS_FOLDER));
				}
			}

			return this.successfulValidation();
		} catch (e) {
			return this.unsuccessfulValidation(e.getErrorMessage());
		}
	}
}
