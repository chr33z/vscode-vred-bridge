import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {

	const setPortCommand = vscode.commands.registerCommand('vscode-vred-bridge.setPort', async () => {
		if (!vscode.workspace.workspaceFolders) {
			return;
		}

		const port = getPortNumber() + "" || "8000";
		const result = await vscode.window.showInputBox({
			value: port,
			placeHolder: 'Port number for VRED Webinterface: Default is 8000',
			validateInput: text => {
				return parseInt(text) ? undefined : "Value must be a number in ranger 0 - 65535";
			}
		});

		setPortNumber(parseInt(result || "0"));
		vscode.window.showInformationMessage(`VRED Webinterface port number is now set to: ${result}`);
	});
	context.subscriptions.push(setPortCommand);

	const runPythonCommand = vscode.commands.registerCommand('vscode-vred-bridge.runPython', () => {
		const port = getPortNumber();
		if (!vscode.workspace.workspaceFolders) {
			return;
		}

		if (!port) {
			vscode.window.showWarningMessage('There is no port number set to connect to VREDs Webinterface. Run "VRED Bridge - Set VRED Port Number" to set it.');
			return;
		}

		const document = vscode.window.activeTextEditor?.document;
		if (document) {
			sendPythonScript(document, port);
		}
		else {
			vscode.window.showWarningMessage('There is no python script that can be send to VRED. Open a python script and try again.');
		}
	});
	context.subscriptions.push(runPythonCommand);
}

export function sendPythonScript(document: vscode.TextDocument, port: number): void {
	axios.get(`http://localhost:${port}/pythonapi?value=${document.getText()}`).then((response) => {
		console.log(response.data);
	});
}

export function setPortNumber(port: number): void {
	if (vscode.workspace.workspaceFolders) {
		const config = vscode.workspace.getConfiguration('vscode-vred-bridge', vscode.workspace.workspaceFolders[0].uri);
		config.update('port', port);
	}
	else {
		vscode.window.showWarningMessage('Cannot set port number. There is no workspace folder to store the port number.');
	}
}

export function getPortNumber(): number | undefined {
	if (vscode.workspace.workspaceFolders) {
		const config = vscode.workspace.getConfiguration('vscode-vred-bridge', vscode.workspace.workspaceFolders[0].uri);
		return config.get('port');
	}
	else {
		vscode.window.showWarningMessage('Cannot get port number. There is no workspace folder to read the port number from.');
	}
}

export function deactivate() { }