import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';
import { 
  INSERT_ORDERED_LIST_COMMAND, 
  INSERT_UNORDERED_LIST_COMMAND, 
  INSERT_CHECK_LIST_COMMAND,
  $isListNode,
  ListNode
} from '@lexical/list';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $patchStyleText } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, Code, Link2, 
  Undo, Redo, ChevronDown, List, Type, 
  Minus, Plus, Baseline, Highlighter, 
  CaseSensitive, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Plus as PlusIcon,
  Heading1, Heading2, Heading3, Text as TextIcon,
  Quote as QuoteIcon, CheckSquare, Table as TableIcon,
  Maximize2, Minimize2, Sparkles, Loader2,
  FileText, Zap, Languages, MessageCircle, Image as ImageIcon
} from 'lucide-react';
import { enhanceContent } from '../../../services/geminiService';

const FONT_FAMILY_OPTIONS = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times'],
  ['Trebuchet MS', 'Trebuchet'],
  ['Verdana', 'Verdana'],
];

function Dropdown({ 
  label, 
  icon: Icon, 
  children, 
  className = "",
  showLabel = true
}: { 
  label: string; 
  icon?: any; 
  children: React.ReactNode;
  className?: string;
  showLabel?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 hover:bg-white hover:shadow-sm rounded text-gray-600 text-xs font-black uppercase tracking-widest transition-all border border-transparent hover:border-gray-100 ${isOpen ? 'bg-white shadow-sm border-gray-100' : ''}`}
      >
        {Icon && <Icon size={16} className={showLabel ? "text-gray-400" : ""} />}
        {showLabel && <span className="truncate max-w-[80px]">{label}</span>}
        <ChevronDown size={12} className={`opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 shadow-2xl rounded z-[1000] py-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, { 
                onClick: () => {
                  if (child.props && (child.props as any).onClick) {
                    (child.props as any).onClick();
                  }
                  setIsOpen(false);
                }
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ 
  onClick, 
  icon: Icon, 
  label, 
  active = false 
}: { 
  onClick?: () => void; 
  icon?: any; 
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-left transition-all ${
        active ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {Icon && <Icon size={16} className={active ? 'text-purple-600' : 'text-gray-400'} />}
      {label}
    </button>
  );
}

export default function ToolbarPlugin({ 
  isFullScreen, 
  onToggleFullScreen 
}: { 
  isFullScreen?: boolean; 
  onToggleFullScreen?: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [blockType, setBlockType] = useState('paragraph');
  const [alignment, setAlignment] = useState('left');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsCode(selection.hasFormat('code'));

      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' 
        ? anchorNode 
        : anchorNode.getTopLevelElementOrThrow();
      
      if ($isListNode(element)) {
        setBlockType(element.getListType() === 'bullet' ? 'bullet' : 'number');
      } else {
        const type = $isHeadingNode(element) ? element.getTag() : element.getType();
        setBlockType(type);
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(CAN_UNDO_COMMAND, (payload) => { setCanUndo(payload); return false; }, 1),
      editor.registerCommand(CAN_REDO_COMMAND, (payload) => { setCanRedo(payload); return false; }, 1)
    );
  }, [editor, updateToolbar]);

  const applyStyleText = useCallback((styles: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  }, [editor]);

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(8, Math.min(72, parseInt(fontSize) + delta));
    setFontSize(newSize.toString());
    applyStyleText({ 'font-size': `${newSize}px` });
  };

  const formatHeading = (level: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(level));
      }
    });
  };

  const handleAiEnhance = async (action: 'improve' | 'summarize' | 'expand' | 'tone-professional' | 'tone-friendly') => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const selectedText = selection.getTextContent();
    if (!selectedText) return;

    setIsAiLoading(true);
    try {
      const enhancedText = await enhanceContent(selectedText, action);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(enhancedText);
        }
      });
    } catch (error) {
      console.error("AI Enhance Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`
      border-gray-100 flex items-center gap-1 transition-all duration-700 no-scrollbar sticky top-0
      ${isFullScreen 
        ? 'bg-white/95 backdrop-blur-xl z-[200] px-12 py-5 shadow-sm opacity-100 max-h-[120px] border-b border-gray-100' 
        : 'max-h-0 opacity-0 pointer-events-none border-b-0 p-0 overflow-hidden'}
    `}>
      {/* History Group */}
      <div className="flex items-center gap-0.5 bg-white/50 p-1 rounded border border-gray-100/50">
        <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} disabled={!canUndo} className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-all"><Undo size={16} /></button>
        <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} disabled={!canRedo} className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-all"><Redo size={16} /></button>
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1 opacity-50" />

      {/* Block & Font Group */}
      <div className="flex items-center gap-1">
        <Dropdown label={blockType === 'bullet' ? 'Bullet' : blockType === 'number' ? 'Number' : blockType} icon={TextIcon}>
          <DropdownItem onClick={() => formatHeading('h1')} icon={Heading1} label="Heading 1" active={blockType === 'h1'} />
          <DropdownItem onClick={() => formatHeading('h2')} icon={Heading2} label="Heading 2" active={blockType === 'h2'} />
          <DropdownItem onClick={() => formatHeading('h3')} icon={Heading3} label="Heading 3" active={blockType === 'h3'} />
          <DropdownItem onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} icon={List} label="Bullet List" active={blockType === 'bullet'} />
          <DropdownItem onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} icon={List} label="Numbered List" active={blockType === 'number'} />
          <DropdownItem onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)} icon={CheckSquare} label="Check List" active={blockType === 'check'} />
          <DropdownItem onClick={() => editor.update(() => { const s = $getSelection(); if ($isRangeSelection(s)) $setBlocksType(s, () => $createQuoteNode()); })} icon={QuoteIcon} label="Quote" active={blockType === 'quote'} />
        </Dropdown>

        <Dropdown label={fontFamily} icon={Type}>
          {FONT_FAMILY_OPTIONS.map(([val, label]) => (
            <DropdownItem key={val} onClick={() => { setFontFamily(val); applyStyleText({ 'font-family': val }); }} label={label} active={fontFamily === val} />
          ))}
        </Dropdown>

        <div className="flex items-center bg-white/50 border border-gray-100/50 rounded p-1 gap-1">
          <button onClick={() => handleFontSizeChange(-1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-gray-900 transition-all"><Minus size={14} /></button>
          <div className="px-2 text-[11px] font-black text-gray-700 min-w-[28px] text-center">{fontSize}</div>
          <button onClick={() => handleFontSizeChange(1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-gray-900 transition-all"><Plus size={14} /></button>
        </div>
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1 opacity-50" />

      {/* Formatting Group */}
      <div className="flex items-center gap-0.5 bg-white/50 p-1 rounded border border-gray-100/50">
        <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={`p-2 rounded text-xs font-black transition-all ${isBold ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-900'}`}>B</button>
        <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={`p-2 rounded text-xs font-black transition-all ${isItalic ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-900'}`}>I</button>
        <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={`p-2 rounded text-xs font-black transition-all ${isUnderline ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-900'}`}>U</button>
        <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')} className={`p-2 rounded text-gray-400 hover:text-gray-900 transition-all ${isCode ? 'bg-white shadow-sm text-purple-600' : ''}`}><Code size={16} /></button>
        <button className="p-2 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-gray-900 transition-all"><Link2 size={16} /></button>
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1 opacity-50" />

      {/* Insert & Align Group */}
      <div className="flex items-center gap-1">
        <Dropdown label="Insert" icon={PlusIcon}>
          <DropdownItem onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)} icon={Minus} label="Separator" />
          <DropdownItem onClick={() => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' })} icon={TableIcon} label="Table (3x3)" />
          <DropdownItem onClick={() => {}} icon={ImageIcon} label="Image" />
        </Dropdown>

        <Dropdown label={alignment.toUpperCase()} icon={alignment === 'left' ? AlignLeft : alignment === 'center' ? AlignCenter : alignment === 'right' ? AlignRight : AlignJustify}>
          <DropdownItem onClick={() => { setAlignment('left'); editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'); }} icon={AlignLeft} label="Left" active={alignment === 'left'} />
          <DropdownItem onClick={() => { setAlignment('center'); editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'); }} icon={AlignCenter} label="Center" active={alignment === 'center'} />
          <DropdownItem onClick={() => { setAlignment('right'); editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'); }} icon={AlignRight} label="Right" active={alignment === 'right'} />
          <DropdownItem onClick={() => { setAlignment('justify'); editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'); }} icon={AlignJustify} label="Justify" active={alignment === 'justify'} />
        </Dropdown>
        <Dropdown 
          label="" 
          icon={isAiLoading ? Loader2 : Sparkles}
          showLabel={false}
          className={`
            w-11 h-11 flex items-center justify-center  bg-white hover:bg-purple-50 transition-all ml-8
            ${isAiLoading ? 'animate-pulse opacity-50' : ''}
          `}
        >
          <div className="px-4 py-3 text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] border-b border-purple-50">AI Assistant</div>
          <DropdownItem onClick={() => handleAiEnhance('improve')} icon={Zap} label="Improve Writing" />
          <DropdownItem onClick={() => handleAiEnhance('summarize')} icon={FileText} label="Summarize" />
          <DropdownItem onClick={() => handleAiEnhance('expand')} icon={Plus} label="Expand Content" />
          <DropdownItem onClick={() => handleAiEnhance('tone-professional')} icon={Languages} label="Professional Tone" />
          <DropdownItem onClick={() => handleAiEnhance('tone-friendly')} icon={MessageCircle} label="Friendly Tone" />
        </Dropdown>
      </div>

      {/* Right Action Group */}
      <div className="ml-auto flex items-center gap-3">
        <button 
          onClick={onToggleFullScreen}
          className="w-11 h-11 flex items-center justify-center bg-white border border-gray-100 hover:border-purple-200 rounded-md text-gray-400 hover:text-purple-600 transition-all shadow-sm group"
          title={isFullScreen ? "Exit Focus" : "Focus Mode"}
        >
          {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} className="group-hover:scale-110 transition-transform" />}
        </button>
      </div>
    </div>
  );
}
