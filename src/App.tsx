import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RuleEditor } from './components/RuleEditor';
import { PreviewPane, FileData } from './components/PreviewPane';
import { Rule } from './engine/RuleParser';
import { Upload, Download, Settings, Play, Globe, CheckCircle } from 'lucide-react';
import Worker from './engine/worker?worker';
import { translations } from './translations';
import { defaultPreprocessor } from './engine/FilePreprocessor';
import { EpubDocument } from './engine/EpubProcessor';

export default function App() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const t = translations[lang];
  const [mobileTab, setMobileTab] = useState<'rules' | 'preview'>('rules');
  
  const [rules, setRules] = useState<Rule[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker();
    workerRef.current.onmessage = (e) => {
      if (e.data.success) {
        setFiles(prev => prev.map(f => {
          if (f.id === e.data.fileId) {
            if (f.isEpub && f.epubDoc) {
              const processedArray = e.data.result;
              const processedPreview = f.epubDoc.getPreviewText(processedArray);
              return { ...f, processed: processedPreview, processedArray, isProcessing: false };
            } else {
              return { ...f, processed: e.data.result, isProcessing: false };
            }
          }
          return f;
        }));
      } else {
        console.error('Worker error:', e.data.error);
        setFiles(prev => prev.map(f => 
          f.id === e.data.fileId ? { ...f, isProcessing: false } : f
        ));
        alert('Error processing text: ' + e.data.error);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (isProcessing && files.length > 0 && files.every(f => !f.isProcessing)) {
      setIsProcessing(false);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  }, [files, isProcessing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles: FileData[] = [];
    for (const file of selectedFiles) {
      const isEpub = file.name.toLowerCase().endsWith('.epub');
      const buffer = await file.arrayBuffer();
      
      if (isEpub) {
        try {
          const epubDoc = await EpubDocument.load(buffer);
          const originalArray = epubDoc.getTextArray();
          const originalPreview = epubDoc.getPreviewText(originalArray);
          
          newFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            original: originalPreview,
            processed: '',
            isProcessing: true,
            isEpub: true,
            epubDoc,
            originalArray
          });
        } catch (error) {
          console.error("Failed to load EPUB:", error);
          alert(`Failed to load EPUB file: ${file.name}`);
        }
      } else {
        const text = defaultPreprocessor.process(buffer);
        newFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          original: text,
          processed: '',
          isProcessing: true,
          isEpub: false
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    newFiles.forEach(f => {
      workerRef.current?.postMessage({
        fileId: f.id,
        text: f.isEpub ? f.originalArray : f.original,
        rules,
        caseSensitive
      });
    });
    
    e.target.value = '';
  };

  const processFiles = (filesToProcess: FileData[], currentRules: Rule[], isCaseSensitive: boolean) => {
    if (filesToProcess.length === 0) return;
    
    setIsProcessing(true);
    setFiles(prev => prev.map(f => 
      filesToProcess.some(ftp => ftp.id === f.id) ? { ...f, isProcessing: true } : f
    ));

    filesToProcess.forEach(f => {
      workerRef.current?.postMessage({
        fileId: f.id,
        text: f.isEpub ? f.originalArray : f.original,
        rules: currentRules,
        caseSensitive: isCaseSensitive
      });
    });
  };

  const handleRun = () => {
    processFiles(files, rules, caseSensitive);
  };

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleExport = () => {
    files.forEach(async file => {
      if (file.isEpub && file.epubDoc && file.processedArray) {
        const blob = await file.epubDoc.generateBlob(file.processedArray);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (!file.isEpub && file.processed) {
        // Add UTF-8 BOM to ensure Excel/Windows recognizes it as UTF-8
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, file.processed], { type: 'text/plain;charset=utf-8' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 text-slate-900 font-sans relative">
      {/* Top Bar */}
      <header className="h-auto min-h-16 py-3 md:py-0 md:h-16 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 shadow-sm z-10 gap-3 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-inner shrink-0">
              <Settings size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              {t.appName}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap">
            <input 
              type="checkbox" 
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            {t.caseSensitive}
          </label>
          
          <div className="h-6 w-px bg-slate-200 mx-1 md:mx-2 shrink-0" />
          
          <label className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap">
            <Upload size={16} />
            <span className="hidden sm:inline">{t.importFile}</span>
            <input type="file" multiple className="hidden" accept=".txt,.md,.csv,.json,.epub" onChange={handleFileUpload} />
          </label>
          
          <button 
            onClick={handleRun}
            disabled={files.length === 0 || isProcessing}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
          >
            <Play size={16} fill="currentColor" />
            <span className="hidden sm:inline">{t.runRules}</span>
          </button>
          
          <button 
            onClick={handleExport}
            disabled={files.length === 0 || isProcessing}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
          >
            <Download size={16} />
            <span className="hidden sm:inline">{t.export}</span>
          </button>

          {/* Language Toggle */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} 
            className="flex items-center gap-1 px-2 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors whitespace-nowrap ml-auto md:ml-2"
          >
            <Globe size={16} /> {lang === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b border-slate-200 bg-white shrink-0">
        <button 
          onClick={() => setMobileTab('rules')} 
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${mobileTab === 'rules' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {t.rulesTab}
        </button>
        <button 
          onClick={() => setMobileTab('preview')} 
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${mobileTab === 'preview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          {t.previewTab}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Rules */}
        <div className={`${mobileTab === 'rules' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 md:min-w-[350px] md:max-w-[500px] h-full shadow-lg z-0 relative flex-col`}>
          <RuleEditor 
            rules={rules} 
            t={t}
            onChange={setRules} 
          />
        </div>
        
        {/* Right Panel: Preview */}
        <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 h-full flex-col`}>
          <PreviewPane 
            files={files} 
            isProcessing={isProcessing} 
            t={t}
            onRemoveFile={handleRemoveFile}
          />
        </div>
      </main>

      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 z-50 transition-all duration-300">
          <CheckCircle size={18} className="text-emerald-400" />
          <span className="text-sm font-medium">{t.processingComplete}</span>
        </div>
      )}
    </div>
  );
}
