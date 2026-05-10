import { TrieEngine } from './TrieEngine';
import { RuleParser, Rule } from './RuleParser';

self.onmessage = (e: MessageEvent) => {
  const { fileId, text, rules, caseSensitive } = e.data as { fileId: string, text: string | string[], rules: Rule[], caseSensitive: boolean };
  
  try {
    const expandedRules = RuleParser.expandRules(rules);
    const engine = new TrieEngine(expandedRules, caseSensitive);
    
    let result;
    if (Array.isArray(text)) {
      result = text.map(t => engine.process(t));
    } else {
      result = engine.process(text);
    }
    
    self.postMessage({ success: true, fileId, result });
  } catch (error: any) {
    self.postMessage({ success: false, fileId, error: error.message });
  }
};
