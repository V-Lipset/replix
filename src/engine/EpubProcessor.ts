import JSZip from 'jszip';

export class EpubDocument {
  zip: JSZip;
  htmlFiles: { path: string; doc: Document; textNodes: Text[] }[] = [];

  constructor(zip: JSZip) {
    this.zip = zip;
  }

  static async load(buffer: ArrayBuffer): Promise<EpubDocument> {
    const zip = await JSZip.loadAsync(buffer);
    const epub = new EpubDocument(zip);
    await epub.parse();
    return epub;
  }

  private async parse() {
    const containerFile = this.zip.file('META-INF/container.xml');
    if (!containerFile) throw new Error('Invalid EPUB: META-INF/container.xml not found');
    
    const containerXml = await containerFile.async('text');
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'text/xml');
    const rootfile = containerDoc.querySelector('rootfile');
    if (!rootfile) throw new Error('Invalid EPUB: rootfile not found in container.xml');
    
    const opfPath = rootfile.getAttribute('full-path');
    if (!opfPath) throw new Error('Invalid EPUB: full-path attribute missing');
    
    const opfFile = this.zip.file(opfPath);
    if (!opfFile) throw new Error(`Invalid EPUB: OPF file not found at ${opfPath}`);
    
    const opfXml = await opfFile.async('text');
    const opfDoc = parser.parseFromString(opfXml, 'text/xml');
    
    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/')) : '';
    
    const items = Array.from(opfDoc.querySelectorAll('manifest > item'));
    const htmlItems = items.filter(item => {
      const mediaType = item.getAttribute('media-type');
      return mediaType === 'application/xhtml+xml' || mediaType === 'text/html';
    });

    for (const item of htmlItems) {
      const href = item.getAttribute('href');
      if (!href) continue;
      
      const decodedHref = decodeURIComponent(href);
      const fullPath = opfDir ? `${opfDir}/${decodedHref}` : decodedHref;
      
      const file = this.zip.file(fullPath);
      if (!file) continue;
      
      const htmlStr = await file.async('text');
      const doc = parser.parseFromString(htmlStr, 'application/xhtml+xml');
      
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(
        doc.body || doc.documentElement,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (node.parentNode) {
              const tag = node.parentNode.nodeName.toLowerCase();
              if (tag === 'script' || tag === 'style') {
                return NodeFilter.FILTER_REJECT;
              }
            }
            return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
          }
        }
      );

      let currentNode;
      while ((currentNode = walker.nextNode())) {
        textNodes.push(currentNode as Text);
      }

      this.htmlFiles.push({ path: fullPath, doc, textNodes });
    }
  }

  getTextArray(): string[] {
    const arr: string[] = [];
    for (const file of this.htmlFiles) {
      for (const node of file.textNodes) {
        arr.push(node.nodeValue || '');
      }
    }
    return arr;
  }

  getPreviewText(textArray: string[]): string {
    return textArray.join('\n\n');
  }

  async generateBlob(processedTextArray: string[]): Promise<Blob> {
    let index = 0;
    const serializer = new XMLSerializer();
    
    for (const file of this.htmlFiles) {
      for (const node of file.textNodes) {
        if (index < processedTextArray.length) {
          node.nodeValue = processedTextArray[index];
          index++;
        }
      }
      // Serialize back to string
      const newHtmlStr = serializer.serializeToString(file.doc);
      this.zip.file(file.path, newHtmlStr);
    }
    
    return await this.zip.generateAsync({ type: 'blob' });
  }
}
