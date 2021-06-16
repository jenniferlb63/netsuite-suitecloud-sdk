/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { COMMAND, LIST_FILES } from '../service/TranslationKeys';
import { actionResultStatus } from '../util/ExtensionUtil';

import BaseAction from './BaseAction';
import { FolderItem } from '../types/FolderItem';
import ListFilesService from '../service/ListFilesService';

const COMMAND_NAME = 'listfiles';

const LIST_FILES_COMMAND = {
	OPTIONS: {
		FOLDER: 'folder',
	},
};

export default class ListFiles extends BaseAction {
	private listFilesService: ListFilesService;

	constructor() {
		super(COMMAND_NAME);
		this.listFilesService = new ListFilesService(this.messageService, this.translationService);
	}

	protected async execute(): Promise<void> {
		try {
			let fileCabinetFolders: FolderItem[] = await this.listFilesService.getListFolders(COMMAND_NAME);
			const selectedFolder = await this.listFilesService.selectFolder(fileCabinetFolders);
			if (selectedFolder) {
				await this._listFiles(selectedFolder.label);
			}
		} catch (e) {
			this.vsConsoleLogger.error(e);
			this.messageService.showCommandError();
		}
	}

	private async _listFiles(selectedFolder: string) {
		const listfilesOptions: { [key: string]: string } = {};
		listfilesOptions[LIST_FILES_COMMAND.OPTIONS.FOLDER] = selectedFolder;

		const commandActionPromise = this.runSuiteCloudCommand(listfilesOptions);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LISTING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
	}
}
