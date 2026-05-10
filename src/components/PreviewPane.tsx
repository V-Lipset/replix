import React, { useState, useCallback } from 'react';
import { Translation } from '../translations';
import { ChevronDown, ChevronRight, Minimize2, Maximize2, Trash2, Book } from 'lucide-react';

export interface FileData {
  id: string;
  name: string;
  original: string;
  processed: string;
  isProcessing: boolean;
  isEpub: boolean;
  epubDoc?: any;
  originalArray?: string[];
  processedArray?: string[];
}

interface FilePreviewItemProps {
  file: FileData;
  isCollapsed: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  t: Translation;
}

const FilePreviewItem = React.memo(({ file, isCollapsed, onToggle, onRemove, t }: FilePreviewItemProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <button 
          onClick={() => onToggle(file.id)} 
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          {file.isEpub && <Book size={14} className="text-indigo-500" />}
          {file.name}
        </button>
        <button 
          onClick={() => onRemove(file.id)} 
          className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors" 
          title={t.removeFile}
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 h-64 ${isCollapsed ? 'hidden' : ''}`}>
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 text-xs font-medium text-slate-500 shrink-0">
            {t.originalFile}
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-slate-700 whitespace-pre-wrap break-words">
            {file.original}
          </div>
        </div>
        
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
          <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 text-xs font-medium text-indigo-700 shrink-0">
            {t.processedOutput}
          </div>
          <div className={`flex-1 p-4 overflow-y-auto font-mono text-sm text-slate-700 whitespace-pre-wrap break-words transition-opacity ${file.isProcessing ? 'opacity-50' : 'opacity-100'}`}>
            {file.processed}
          </div>
        </div>
      </div>
    </div>
  );
});

interface PreviewPaneProps {
  files: FileData[];
  isProcessing: boolean;
  t: Translation;
  onRemoveFile: (id: string) => void;
}

export const PreviewPane = React.memo(({ files, isProcessing, t, onRemoveFile }: PreviewPaneProps) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const isAllCollapsed = files.length > 0 && collapsed.size === files.length;

  const toggleAll = useCallback(() => {
    if (isAllCollapsed) {
      setCollapsed(new Set());
    } else {
      setCollapsed(new Set(files.map(f => f.id)));
    }
  }, [isAllCollapsed, files]);

  const toggleFile = useCallback((id: string) => {
    setCollapsed(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(id)) {
        newCollapsed.delete(id);
      } else {
        newCollapsed.add(id);
      }
      return newCollapsed;
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{t.previewTab}</h2>
          {isProcessing && (
            <span className="text-xs font-medium text-indigo-600 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              {t.processing}
            </span>
          )}
        </div>
        {files.length > 0 && (
          <button 
            onClick={toggleAll} 
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            {isAllCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            {isAllCollapsed ? t.expandAll : t.collapseAll}
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {files.map(file => (
          <FilePreviewItem 
            key={file.id}
            file={file}
            isCollapsed={collapsed.has(file.id)}
            onToggle={toggleFile}
            onRemove={onRemoveFile}
            t={t}
          />
        ))}
      </div>
    </div>
  );
});
