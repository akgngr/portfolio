import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin, MenuOption, useBasicTypeaheadTriggerMatch } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { useCallback, useMemo, useState } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND } from '@lexical/list';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $getSelection, $isRangeSelection } from 'lexical';
import { Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Minus, Code } from 'lucide-react';

class SlashMenuItem extends MenuOption {
  title: string;
  icon: React.ReactNode;
  onSelect: (queryString: string) => void;

  constructor(title: string, options: { icon: React.ReactNode; onSelect: (queryString: string) => void }) {
    super(title);
    this.title = title;
    this.icon = options.icon;
    this.onSelect = options.onSelect;
  }
}

function SlashMenuItemComponent({
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: SlashMenuItem;
}) {
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={`flex items-center gap-3 p-2 mx-1 cursor-pointer rounded-lg transition-colors ${
        isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
      }`}
      ref={option.setRefElement}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 text-gray-700">
        {option.icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{option.title}</p>
      </div>
    </li>
  );
}

export default function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(() => {
    return [
      new SlashMenuItem('Başlık 1', {
        icon: <Heading1 size={18} />,
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h1'));
            }
          });
        },
      }),
      new SlashMenuItem('Başlık 2', {
        icon: <Heading2 size={18} />,
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h2'));
            }
          });
        },
      }),
      new SlashMenuItem('Başlık 3', {
        icon: <Heading3 size={18} />,
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h3'));
            }
          });
        },
      }),
      new SlashMenuItem('Madde İşaretli Liste', {
        icon: <List size={18} />,
        onSelect: () => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        },
      }),
      new SlashMenuItem('Numaralı Liste', {
        icon: <ListOrdered size={18} />,
        onSelect: () => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        },
      }),
      new SlashMenuItem('Görev Listesi', {
        icon: <CheckSquare size={18} />,
        onSelect: () => {
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        },
      }),
      new SlashMenuItem('Alıntı', {
        icon: <Quote size={18} />,
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          });
        },
      }),
      new SlashMenuItem('Ayırıcı Çizgi', {
        icon: <Minus size={18} />,
        onSelect: () => {
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
        },
      }),
    ];
  }, [editor]);

  const onSelectOption = useCallback(
    (selectedOption: SlashMenuItem, nodeToRemove: any, closeMenu: () => void) => {
      editor.update(() => {
        if (nodeToRemove) {
          nodeToRemove.remove();
        }
        selectedOption.onSelect(queryString || '');
        closeMenu();
      });
    },
    [editor, queryString]
  );

  return (
    <LexicalTypeaheadMenuPlugin<SlashMenuItem>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && options.length
          ? ReactDOM.createPortal(
              <div className="bg-white shadow-2xl rounded-md border border-gray-200 overflow-hidden z-[2000] py-2 min-w-[240px]">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bloklar</div>
                <ul>
                  {options.map((option, i) => (
                    <SlashMenuItemComponent
                      key={option.key}
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => selectOptionAndCleanUp(option)}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}
