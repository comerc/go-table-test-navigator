import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Go Table Test Navigator is now active!');

  // Регистрируем команду для перехода к табличному тесту
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
    // Извлекаем имя теста из ID
    const testId = testItem.id;
    const match = testId.match(/\/([^\/]+)$/);

    if (!match) {
      vscode.window.showErrorMessage('Could not extract test case name');
      return;
    }

    const caseName = match[1];

    // Получаем URI файла из testItem или его родителя
    let fileUri = testItem.uri;
    if (!fileUri && testItem.parent) {
      fileUri = testItem.parent.uri;
    }

    if (!fileUri) {
      vscode.window.showErrorMessage('Could not find test file');
      return;
    }

    // Открываем файл
    const document = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(document);

    // Ищем строку с тестовым кейсом
    const text = document.getText();
    const lines = text.split('\n');

    // Получаем имя родительского теста
    const parentTestName = testItem.parent ?
      testItem.parent.id.match(/#([^\/]+)/)?.[1] : null;

    // Создаем варианты поиска (с пробелами и подчеркиваниями)
    const caseNameWithSpaces = caseName.replace(/_/g, ' ');
    const caseNameWithUnderscores = caseName.replace(/ /g, '_');

    let foundLine = -1;
    let inCorrectTestFunction = false;

    // Сначала ищем с name: (приоритетный поиск)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Проверяем, находимся ли в правильной тестовой функции
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

      // Ищем name: "test22" с пробелами/табуляциями
      if (line.includes(`name: "${caseName}"`) ||
        line.includes(`name: "${caseNameWithSpaces}"`) ||
        line.includes(`name: "${caseNameWithUnderscores}"`) ||
        line.match(new RegExp(`name:\\s+"${caseName}"`)) ||
        line.match(new RegExp(`name:\\s+"${caseNameWithSpaces}"`)) ||
        line.match(new RegExp(`name:\\s+"${caseNameWithUnderscores}"`))) {
        foundLine = i;
        break;
      }
    }

    // Если не нашли с name:, ищем просто в кавычках
    if (foundLine === -1) {
      inCorrectTestFunction = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Проверяем, находимся ли в правильной тестовой функции
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

        // Ищем просто "test22" в кавычках
        if (line.includes(`"${caseName}"`) ||
          line.includes(`"${caseNameWithSpaces}"`) ||
          line.includes(`"${caseNameWithUnderscores}"`)) {
          foundLine = i;
          break;
        }
      }
    }

    if (foundLine !== -1) {
      // Переходим к найденной строке
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