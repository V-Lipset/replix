class TrieNode {
  children: Map<string, TrieNode> = new Map();
  replacement: string | null = null;
}

export class TrieEngine {
  root: TrieNode = new TrieNode();
  caseSensitive: boolean;

  constructor(rules: {original: string, replacement: string}[], caseSensitive: boolean = false) {
    this.caseSensitive = caseSensitive;
    for (const rule of rules) {
      this.insert(rule.original, rule.replacement);
    }
  }

  insert(original: string, replacement: string) {
    let node = this.root;
    const word = this.caseSensitive ? original : original.toLowerCase();
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    if (node.replacement === null) {
      node.replacement = replacement;
    }
  }

  process(text: string): string {
    let result = '';
    let i = 0;
    while (i < text.length) {
      let node = this.root;
      let longestMatchLength = 0;
      let longestReplacement: string | null = null;
      
      let j = i;
      while (j < text.length) {
        const char = this.caseSensitive ? text[j] : text[j].toLowerCase();
        if (node.children.has(char)) {
          node = node.children.get(char)!;
          if (node.replacement !== null) {
            longestMatchLength = j - i + 1;
            longestReplacement = node.replacement;
          }
          j++;
        } else {
          break;
        }
      }
      
      if (longestMatchLength > 0) {
        result += longestReplacement;
        i += longestMatchLength;
      } else {
        result += text[i];
        i++;
      }
    }
    return result;
  }
}
