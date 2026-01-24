import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes } from 'lexical';
import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Command } from 'lucide-react';
import theme from './EditorTheme';

// Plugins
import ToolbarPlugin from './plugins/ToolbarPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import SlashCommandPlugin from './plugins/SlashCommandPlugin';
import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin';

interface LexicalEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function OnChangeHTMLPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor);
          onChange(htmlString);
        });
      }}
    />
  );
}

function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender && content) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        $insertNodes(nodes);
      });
      setIsFirstRender(false);
    }
  }, [content, editor, isFirstRender]);
  
  return null;
}

const editorConfig = {
  namespace: 'PortfolioEditor',
  theme,
  onError(error: Error) {
    console.error(error);
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    HorizontalRuleNode,
  ],
};

export function LexicalEditor({ content, onChange, placeholder = 'Start writing your story...' }: LexicalEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isFullScreen]);

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className={`
        ${isFullScreen 
          ? 'fixed inset-0 z-[500] bg-white animate-in fade-in zoom-in-95 duration-500 overflow-hidden' 
          : 'bg-white rounded-lg shadow-sm border border-gray-100 group hover:border-gray-200 transition-all relative'}
      `}>
        <ToolbarPlugin isFullScreen={isFullScreen} onToggleFullScreen={toggleFullScreen} />
        
        <div className={`
          bg-white relative flex group/editor 
          ${isFullScreen ? 'h-[calc(100vh-80px)] overflow-y-auto' : ''}
        `}>
          <div 
            className={`
              flex-1 relative transition-all duration-700
              ${isFullScreen ? 'max-w-4xl mx-auto px-10 py-2' : ''}
            `}
            onClick={() => {
              if (!isFullScreen) toggleFullScreen();
            }}
          >
            <RichTextPlugin
              contentEditable={
                <ContentEditable className={`
                  focus:outline-none px-2 py-16 min-h-180 transition-all
                  ${isFullScreen ? 'prose prose-2xl max-w-none' : 'prose prose-lg max-w-none'}
                `} />
              }
              placeholder={
                <div className={`
                  absolute text-gray-200 pointer-events-none transition-all duration-700 font-medium select-none
                  ${isFullScreen 
                    ? 'top-16 left-12 text-2xl leading-[1.8]' 
                    : 'top-16 left-12 text-xl leading-[1.8]'}
                `}>
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <LinkPlugin />
            <TablePlugin />
            <TabIndentationPlugin />
            <HorizontalRulePlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <AutoLinkPlugin />
            <SlashCommandPlugin />
            <FloatingToolbarPlugin />
            <InitialContentPlugin content={content} />
            <OnChangeHTMLPlugin onChange={onChange} />
          </div>
        </div>
        
        {!isFullScreen && (
          <div className="border-t border-gray-50 bg-gray-50/30 p-4 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-purple-50 rounded flex items-center justify-center">
                <Sparkles size={12} className="text-purple-300" />
              </div>
              <span>Click to enter Focus Mode and show Toolbar</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span>Use</span>
              <div className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-100 rounded shadow-sm text-gray-400">
                <Command size={10} />
                <span>/</span>
              </div>
              <span>for quick commands</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .prose h1 { font-weight: 900; color: #111827; tracking: -0.025em; }
        .prose p { color: #374151; line-height: 1.8; font-weight: 450; }
        
        .editor-paragraph { margin: 0 0 16px; }
        .editor-heading-h1 { font-size: 3rem; font-weight: 900; margin-bottom: 2rem; color: #111827; letter-spacing: -0.025em; }
        .editor-heading-h2 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5rem; color: #1f2937; letter-spacing: -0.02em; }
        .editor-heading-h3 { font-size: 1.75rem; font-weight: 700; margin-bottom: 1.25rem; color: #374151; }
        .editor-quote { border-left: 6px solid #8b5cf6; padding: 1rem 0 1rem 2rem; margin: 3rem 0; font-style: italic; color: #4b5563; font-size: 1.5rem; line-height: 1.6; font-weight: 500; background: #fcfaff; border-radius: 0 16px 16px 0; }
        .editor-list-ul { list-style: disc; padding-left: 2rem; margin: 1.5rem 0; }
        .editor-list-ol { list-style: decimal; padding-left: 2rem; margin: 1.5rem 0; }
        .editor-listitem { margin: 12px 0; color: #374151; }
        .editor-link { color: #8b5cf6; text-decoration: underline; font-weight: 600; text-underline-offset: 4px; }
        .editor-text-bold { font-weight: 800; }
        .editor-text-italic { font-style: italic; }
        .editor-text-underline { text-decoration: underline; text-underline-offset: 4px; }
        .editor-code { background: #f8fafc; padding: 4px 8px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85em; color: #e11d48; border: 1px solid #f1f5f9; }
        
        .editor-checklist { list-style: none; padding: 0; margin: 1.5rem 0; }
        .editor-checklist li { position: relative; padding-left: 3rem; margin: 14px 0; font-weight: 500; }
        .editor-checklist li::before { content: ''; position: absolute; left: 0.5rem; top: 0.15rem; width: 1.5rem; height: 1.5rem; border: 2.5px solid #e5e7eb; border-radius: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        
        hr { border: none; border-top: 3px solid #f8fafc; margin: 4rem 0; }
      `}</style>
    </LexicalComposer>
  );
}

export default LexicalEditor;
