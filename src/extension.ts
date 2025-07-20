import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Go Table Test Navigator is now active!');

  // Register command for navigating to table test case
  const disposable = vscode.commands.registerCommand(
    'goTableTestNavigator.goToTableTestCase',
    async (testItem) => {
      if (!testItem) {
        vscode.window.showErrorMessage('No test item selected');
        return;
      }

      await goToTableTestCase(testItem);
    }
  );

  context.subscriptions.push(disposable);
}

async function goToTableTestCase(testItem: any) {
  try {
    // Extract test case name from ID
    const testId = testItem.id;
    const match = testId.match(/\/([^\/]+)$/);

    if (!match) {
      vscode.window.showErrorMessage('Could not extract test case name');
      return;
    }

    const caseName = match[1];

    // Get file URI from testItem or its parent
    let fileUri = testItem.uri;
    if (!fileUri && testItem.parent) {
      fileUri = testItem.parent.uri;
    }

    if (!fileUri) {
      vscode.window.showErrorMessage('Could not find test file');
      return;
    }

    // Open the file
    const document = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(document);

    // Search for the test case line
    const text = document.getText();
    const lines = text.split('\n');

    // Get parent test name for context-aware search
    const parentTestName = testItem.parent ?
      testItem.parent.id.match(/#([^\/]+)/)?.[1] : null;

    // Create search variants (with spaces)
    const caseNameWithSpaces = caseName.replace(/_/g, ' ');

    let foundLine = -1;
    let inCorrectTestFunction = false;

    // First, search with "name:" prefix (priority search)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if we're in the correct test function
      if (parentTestName && line.includes(`func ${parentTestName}`)) {
        inCorrectTestFunction = true;
        continue;
      }

      if (parentTestName && line.match(/^func\s+\w+/) && inCorrectTestFunction) {
        inCorrectTestFunction = false;
        continue;
      }

      if (parentTestName && !inCorrectTestFunction) {
        continue;
      }

      // Search for name: "test_case" with spaces/tabs
      if (line.includes(`name: "${caseName}"`) ||
        line.includes(`name: "${caseNameWithSpaces}"`) ||
        line.match(new RegExp(`name:\\s+"${caseName}"`)) ||
        line.match(new RegExp(`name:\\s+"${caseNameWithSpaces}"`))) {
        foundLine = i;
        break;
      }
    }

    // If not found with "name:", search in quotes only
    if (foundLine === -1) {
      inCorrectTestFunction = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if we're in the correct test function
        if (parentTestName && line.includes(`func ${parentTestName}`)) {
          inCorrectTestFunction = true;
          continue;
        }

        if (parentTestName && line.match(/^func\s+\w+/) && inCorrectTestFunction) {
          inCorrectTestFunction = false;
          continue;
        }

        if (parentTestName && !inCorrectTestFunction) {
          continue;
        }

        // Search for "test_case" in quotes
        if (line.includes(`"${caseName}"`) ||
          line.includes(`"${caseNameWithSpaces}"`)) {
          foundLine = i;
          break;
        }
      }
    }

    if (foundLine !== -1) {
      // Navigate to the found line
      const position = new vscode.Position(foundLine, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position));
    } else {
      vscode.window.showWarningMessage(`Could not find "${caseName}" in the file`);
    }

  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

export function deactivate() { }