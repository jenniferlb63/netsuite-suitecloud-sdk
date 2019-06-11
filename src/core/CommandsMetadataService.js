const path = require('path');
const FileUtils = require('../utils/FileUtils');
const ApplicationConstants = require('../ApplicationConstants');

const SDK_WRAPPER_GENERATOR = 'commands/SDKWrapperCommandGenerator';

function executeForEachCommandMetadata(commandsMetadata, func) {
	for (const commandMetadataId in commandsMetadata) {
		if (commandsMetadata.hasOwnProperty(commandMetadataId)) {
			const commandMetadata = commandsMetadata[commandMetadataId];
			func(commandMetadata);
		}
	}
}

module.exports = class CommandsMetadataService {
	initializeCommandsMetadata(rootCLIPath) {
		var sdkCommandsMetadata = this._getMetadataFromFile(
			path.join(rootCLIPath, ApplicationConstants.SDK_COMMANDS_METADATA_FILE)
		);
		var nodeCommandsMetadata = this._getMetadataFromFile(
			path.join(rootCLIPath, ApplicationConstants.NODE_COMMANDS_METADATA_FILE)
		);
		var commandGeneratorsMetadata = this._getMetadataFromFile(
			path.join(rootCLIPath, ApplicationConstants.COMMAND_GENERATORS_METADATA_FILE)
		);
		var combinedMetadata = {
			...sdkCommandsMetadata,
			...nodeCommandsMetadata,
		};
		combinedMetadata = this._transformCommandsOptionsToObject(combinedMetadata);
		combinedMetadata = this._addCommandGeneratorMetadata(
			commandGeneratorsMetadata,
			combinedMetadata,
			rootCLIPath
		);
		this._commandsMetadata = combinedMetadata;
	}

	getCommandsMetadata() {
		return this._commandsMetadata;
	}

	getCommandMetadataByName(commandName) {
		const commandMetadata = this._commandsMetadata[commandName];
		if (!commandMetadata) {
			throw `No metadata found or initialized for Command ${commandName}`;
		}
		return commandMetadata;
	}

	_getMetadataFromFile(filepath) {
		if (!FileUtils.exists(filepath)) {
			throw `Commands Metadata in filepath ${filepath} not found`;
		}
		try {
			return FileUtils.readAsJson(filepath);
		} catch (error) {
			throw `Error parsing Commands Metadata from ${filepath}`;
		}
	}

	_transformCommandsOptionsToObject(commandsMetadata) {
		executeForEachCommandMetadata(commandsMetadata, commandMetadata => {
			var optionsTransformedIntoObject = commandMetadata.options.reduce((result, item) => {
				if (item.name == null)
					throw 'Invalid Metadata, mising id property in command options';
				result[item.name] = item;
				return result;
			}, {});
			commandMetadata.options = optionsTransformedIntoObject;
		});
		return commandsMetadata;
	}

	_addCommandGeneratorMetadata(commandGeneratorsMetadata, commandsMetadata, rootCLIPath) {
		executeForEachCommandMetadata(commandsMetadata, commandMetadata => {
			var generatorMetadata = commandGeneratorsMetadata.find(generatorMetadata => {
				return generatorMetadata.commandName == commandMetadata.name;
			});

			const defaultGenerator =
				generatorMetadata && generatorMetadata.nonInteractiveGenerator
					? generatorMetadata.nonInteractiveGenerator
					: SDK_WRAPPER_GENERATOR;
			commandMetadata.nonInteractiveGenerator = path.join(rootCLIPath, defaultGenerator);
			commandMetadata.supportsInteractiveMode = false;

			if (generatorMetadata && generatorMetadata.interactiveGenerator) {
				commandMetadata.interactiveGenerator = path.join(
					rootCLIPath,
					generatorMetadata.interactiveGenerator
				);
				commandMetadata.supportsInteractiveMode = true;
			}
		});
		return commandsMetadata;
	}
};
