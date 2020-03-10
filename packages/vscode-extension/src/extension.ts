// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import deploy from './commands/Deploy';
import listobjects from './commands/ListObjects';
const SCLOUD_OUTPUT_CHANNEL_NAME = 'Netsuite SuiteCloud';

export const scloudOutput: vscode.OutputChannel = vscode.window.createOutputChannel(SCLOUD_OUTPUT_CHANNEL_NAME);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Let\'s rock it, Netsuite SuiteCloud VSCode Extension has been activated!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let deployDisposable = vscode.commands.registerCommand('extension.deploy', deploy);
	context.subscriptions.push(deployDisposable);

	let listobjectsDisposable = vscode.commands.registerCommand('extension.listobjects', listobjects);
	context.subscriptions.push(listobjectsDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}