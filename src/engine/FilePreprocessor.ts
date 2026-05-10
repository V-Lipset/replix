export interface PreprocessorRule {
  id: string;
  name: string;
  process: (input: any) => any;
}

export class FilePreprocessor {
  private rules: PreprocessorRule[] = [];

  addRule(rule: PreprocessorRule) {
    this.rules.push(rule);
  }

  process(input: ArrayBuffer): string {
    let current: any = input;
    for (const rule of this.rules) {
      current = rule.process(current);
    }
    return current as string;
  }
}

// Rule 1: UTF-8 Encoding
// Ensures the file is decoded as UTF-8.
export const utf8Rule: PreprocessorRule = {
  id: 'utf8',
  name: 'UTF-8 Encoding',
  process: (input: ArrayBuffer) => {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(input);
  }
};

// Rule 2: Word Wrap (Extensible)
// Normalizes line endings to ensure consistent word wrapping behavior across platforms.
// Hard-wrapping logic (e.g., inserting newlines at 80 chars) can be easily added here.
export const wordWrapRule: PreprocessorRule = {
  id: 'wordWrap',
  name: 'Enable Word Wrap',
  process: (input: string) => {
    return input.replace(/\r\n/g, '\n');
  }
};

// Default pipeline
export const defaultPreprocessor = new FilePreprocessor();
defaultPreprocessor.addRule(utf8Rule);
defaultPreprocessor.addRule(wordWrapRule);
