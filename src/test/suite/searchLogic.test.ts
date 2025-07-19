import * as assert from 'assert';

suite('Search Logic Suite', () => {

  const sampleGoCode = `package main

import "testing"

func TestExample(t *testing.T) {
    tests := []struct {
        name string
        input int
        want int
    }{
        {name: "positive", input: 5, want: 5},
        {name: "negative", input: -3, want: 3},
        {"zero", 0, 0},
        {
            name: "complex_case",
            input: 10,
            want: 10,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // test implementation
        })
    }
}

func TestAnother(t *testing.T) {
    tests := []struct {
        name string
        value string
    }{
        {name: "positive", value: "test"},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // test implementation
        })
    }
}`;

  test('Should find test case with name: prefix', () => {
    const lines = sampleGoCode.split('\n');
    const caseName = 'positive';

    let foundLine = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`name: "${caseName}"`) ||
        line.match(new RegExp(`name:\\s+"${caseName}"`))) {
        foundLine = i;
        break;
      }
    }

    assert.notStrictEqual(foundLine, -1);
    assert.ok(lines[foundLine].includes('name: "positive"'));
  });

  test('Should find test case in quotes without name prefix', () => {
    const lines = sampleGoCode.split('\n');
    const caseName = 'zero';

    let foundLine = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`"${caseName}"`)) {
        foundLine = i;
        break;
      }
    }

    assert.notStrictEqual(foundLine, -1);
    assert.ok(lines[foundLine].includes('"zero"'));
  });

  test('Should find test case within correct function context', () => {
    const lines = sampleGoCode.split('\n');
    const caseName = 'positive';
    const parentTestName = 'TestExample';

    let foundLine = -1;
    let inCorrectTestFunction = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if we're in the correct test function
      if (line.includes(`func ${parentTestName}`)) {
        inCorrectTestFunction = true;
        continue;
      }

      if (line.match(/^func\\s+\\w+/) && inCorrectTestFunction) {
        inCorrectTestFunction = false;
        continue;
      }

      if (!inCorrectTestFunction) {
        continue;
      }

      if (line.includes(`name: "${caseName}"`)) {
        foundLine = i;
        break;
      }
    }

    assert.notStrictEqual(foundLine, -1);
    // Should find the first occurrence in TestExample, not TestAnother
    assert.ok(foundLine < 25); // Approximate line number in TestExample
  });

  test('Should not find non-existent test case', () => {
    const lines = sampleGoCode.split('\n');
    const caseName = 'non_existent_case';

    let foundLine = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`name: "${caseName}"`) ||
        line.includes(`"${caseName}"`)) {
        foundLine = i;
        break;
      }
    }

    assert.strictEqual(foundLine, -1);
  });
});