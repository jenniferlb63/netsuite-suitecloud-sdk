const CliCommandsMetadataService = require('@oracle/netsuite-suitecloud-nodejs-cli/src/core/CommandsMetadataService');

export default class CommandsMetadataSingleton {
    private commandsMetadataServiceSingelton : any;
    private static instance : CommandsMetadataSingleton;

    private constructor() {
      const suitecloudNodeJsSourcePath: string = require.resolve('@oracle/netsuite-suitecloud-nodejs-cli').split('\\suitecloud.js')[0];
	    this.commandsMetadataServiceSingelton = new CliCommandsMetadataService(suitecloudNodeJsSourcePath);
	    this.commandsMetadataServiceSingelton.initializeCommandsMetadata();
    }

    public static getInstance(): CommandsMetadataSingleton {
        if (!this.instance) {
          this.instance = new CommandsMetadataSingleton();
        }
        return this.instance;
      }

    public getMetadata() : any {
        return this.commandsMetadataServiceSingelton;
    }
}


