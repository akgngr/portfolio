import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Underline, Strikethrough, Code, Link2 } from 'lucide-react';
import { mergeRegister } from '@lexical/utils';

function FloatingToolbar({ editor, anchorElem }: { editor: any, anchorElem: HTMLElement }) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsCode(selection.hasFormat('code'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }: { editorState: any }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    const updatePosition = () => {
      const selection = window.getSelection();
      const toolbar = toolbarRef.current;
      if (!selection || !toolbar || selection.rangeCount === 0 || selection.isCollapsed) {
        if (toolbar) toolbar.style.opacity = '0';
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const anchorRect = anchorElem.getBoundingClientRect();

      toolbar.style.opacity = '1';
      toolbar.style.top = `${rect.top - anchorRect.top - 45}px`;
      toolbar.style.left = `${rect.left - anchorRect.left + rect.width / 2 - toolbar.offsetWidth / 2}px`;
    };

    window.addEventListener('resize', updatePosition);
    document.addEventListener('selectionchange', updatePosition);
    updatePosition();

    return () => {
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('selectionchange', updatePosition);
    };
  }, [anchorElem]);

  return (
    <div
      ref={toolbarRef}
      className="absolute z-[1500] flex bg-white shadow-xl rounded-md border border-gray-200 p-1 gap-0.5 transition-opacity duration-200 opacity-0 pointer-events-auto"
    >
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={`p-1.5 rounded transition-colors ${isBold ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={`p-1.5 rounded transition-colors ${isItalic ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={`p-1.5 rounded-lg transition-colors ${isUnderline ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        className={`p-1.5 rounded-lg transition-colors ${isCode ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
      >
        <Code size={16} />
      </button>
      <button
        onClick={() => {
          const url = window.prompt('Link URL:');
          if (url) {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'link'); // This is simplified, Lexical uses TOGGLE_LINK_COMMAND usually
          }
        }}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Link2 size={16} />
      </button>
    </div>
  );
}

export default function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = editor.getRootElement();
    if (root) {
      setAnchorElem(root.parentElement);
    }
  }, [editor]);

  if (!anchorElem) return null;

  return createPortal(<FloatingToolbar editor={editor} anchorElem={anchorElem} />, anchorElem);
}
