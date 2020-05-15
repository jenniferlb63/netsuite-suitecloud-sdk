/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { ADD_DEPENDENCIES, COMMAND } from '../service/TranslationKeys';
import { ActionResult } from '../types/ActionResult';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default class AddDependencies extends BaseAction {

	constructor() {
		super('project:adddependencies');
	}

	protected async execute() {
		const commandActionPromise = this.runSubCommand({});
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.translationService.getMessage(ADD_DEPENDENCIES.COMMAND));
		const statusBarMessage: string = this.translationService.getMessage(ADD_DEPENDENCIES.ADDING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult: ActionResult<any> = await commandActionPromise;

		if (actionResult.status === actionResultStatus.SUCCESS) {
			if (actionResult.data.length > 0) {
				this.messageService.showCommandInfo(this.translationService.getMessage(ADD_DEPENDENCIES.ADDED));
			} else {
				this.messageService.showWarningMessage(this.translationService.getMessage(ADD_DEPENDENCIES.EMPTY));
			}
		} else {
			this.messageService.showCommandError(this.translationService.getMessage(ADD_DEPENDENCIES.ERROR));
		}
	}
}
