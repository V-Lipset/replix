export interface Rule {
  id: string;
  original: string;
  replacement: string;
}

export class RuleParser {
  static parseTextbox(text: string): Rule[] {
    const rawRules = text.split(/[\n，,]/).map(s => s.trim()).filter(s => s.length > 0);
    const rules: Rule[] = [];
    
    for (const raw of rawRules) {
      let orig = '';
      let rep = '';
      
      if (raw.includes('=')) {
        const parts = raw.split('=');
        orig = parts[0].trim();
        rep = parts.slice(1).join('=').trim();
      } else if (raw.includes(':')) {
        const parts = raw.split(':');
        orig = parts[0].trim();
        rep = parts.slice(1).join(':').trim();
      } else if (raw.includes('：')) {
        const parts = raw.split('：');
        orig = parts[0].trim();
        rep = parts.slice(1).join('：').trim();
      } else {
        continue;
      }
      
      if (orig.startsWith('"') && orig.endsWith('"')) {
        orig = orig.slice(1, -1);
      }
      
      rules.push({ id: crypto.randomUUID(), original: orig, replacement: rep });
    }
    
    return rules;
  }

  static toTextbox(rules: Rule[]): string {
    return rules.map(r => `${r.original} = ${r.replacement}`).join('\n');
  }

  static expandRules(rules: Rule[]): Rule[] {
    const expanded: Rule[] = [];
    
    for (const rule of rules) {
      const orig = rule.original;
      const rep = rule.replacement;
      
      const origParts = orig.split(/[\s·]+/);
      let repSeparator = '';
      let repParts: string[] = [];
      
      if (rep.includes('·')) {
        repSeparator = '·';
        repParts = rep.split('·');
      } else if (rep.includes(' ')) {
        repSeparator = ''; // Join without space
        repParts = rep.split(' ');
      } else {
        repSeparator = '';
        repParts = [rep];
      }
      
      if (origParts.length > 1 && origParts.length === repParts.length) {
        expanded.push({ id: crypto.randomUUID(), original: origParts.join(' '), replacement: repParts.join(repSeparator) });
        expanded.push({ id: crypto.randomUUID(), original: origParts.slice().reverse().join(' '), replacement: repParts.join(repSeparator) });
        
        for (let i = 0; i < origParts.length; i++) {
          expanded.push({ id: crypto.randomUUID(), original: origParts[i], replacement: repParts[i] });
        }
      } else {
        expanded.push({ id: crypto.randomUUID(), original: orig, replacement: rep });
      }
    }
    
    // Deduplicate and sort by length descending
    const unique = new Map<string, string>();
    for (const r of expanded) {
      if (!unique.has(r.original)) {
        unique.set(r.original, r.replacement);
      }
    }
    
    const finalRules = Array.from(unique.entries()).map(([o, r]) => ({ id: crypto.randomUUID(), original: o, replacement: r }));
    finalRules.sort((a, b) => b.original.length - a.original.length);
    
    return finalRules;
  }
}
