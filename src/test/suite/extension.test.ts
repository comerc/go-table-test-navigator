import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    // In test environment, extension ID might be different
    const extension = vscode.extensions.getExtension('your-publisher-name.go-table-test-navigator') ||
      vscode.extensions.all.find(ext => ext.packageJSON.name === 'go-table-test-navigator');
    assert.ok(extension);
  });

  test('Should activate extension', async () => {
    const extension = vscode.extensions.getExtension('your-publisher-name.go-table-test-navigator') ||
      vscode.extensions.all.find(ext => ext.packageJSON.name === 'go-table-test-navigator');
    if (extension && !extension.isActive) {
      await extension.activate();
    }
    assert.ok(extension);
  });

  test('Should register goToTableTestCase command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('goTableTestNavigator.goToTableTestCase'));
  });
});