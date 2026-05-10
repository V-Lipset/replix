import React, { useState, useEffect } from 'react';
import { Rule, RuleParser } from '../engine/RuleParser';
import { Plus, Trash2, FileText, List } from 'lucide-react';
import { Translation } from '../translations';

interface RuleEditorProps {
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
  t: Translation;
}

export const RuleEditor = React.memo(({ rules, onChange, t }: RuleEditorProps) => {
  const [mode, setMode] = useState<'structured' | 'textbox'>('structured');
  const [text, setText] = useState('');

  useEffect(() => {
    if (mode === 'textbox') {
      setText(RuleParser.toTextbox(rules));
    }
  }, [mode, rules]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onChange(RuleParser.parseTextbox(e.target.value));
  };

  const addRule = () => {
    onChange([...rules, { id: crypto.randomUUID(), original: '', replacement: '' }]);
  };

  const updateRule = (id: string, field: 'original' | 'replacement', value: string) => {
    onChange(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRule = (id: string) => {
    onChange(rules.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{t.replacementRules}</h2>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setMode('structured')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${mode === 'structured' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List size={14} /> {t.structured}
          </button>
          <button
            onClick={() => setMode('textbox')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${mode === 'textbox' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText size={14} /> {t.textbox}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'textbox' ? (
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full h-full p-3 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            placeholder={t.textboxPlaceholder}
          />
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex gap-2 items-center group">
                <input
                  type="text"
                  value={rule.original}
                  onChange={(e) => updateRule(rule.id, 'original', e.target.value)}
                  placeholder={t.original}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-w-0"
                />
                <span className="text-slate-400 font-mono shrink-0">=</span>
                <input
                  type="text"
                  value={rule.replacement}
                  onChange={(e) => updateRule(rule.id, 'replacement', e.target.value)}
                  placeholder={t.replacement}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-w-0"
                />
                <button
                  onClick={() => removeRule(rule.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addRule}
              className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> {t.addRule}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
