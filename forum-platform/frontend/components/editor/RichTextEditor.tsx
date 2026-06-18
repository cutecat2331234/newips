'use client';

import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write something...',
  minHeight = '200px',
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    onChange?.(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const handleLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const handleImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  }, [execCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  }, [execCommand]);

  const ToolbarButton = ({
    icon: Icon,
    command,
    title,
    value,
    onClick,
  }: {
    icon: any;
    command?: string;
    title: string;
    value?: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={() => (onClick ? onClick() : command && execCommand(command, value))}
      title={title}
      disabled={disabled}
      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-600 bg-slate-700/50">
        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <ToolbarButton icon={Undo} command="undo" title="Undo (Ctrl+Z)" />
          <ToolbarButton icon={Redo} command="redo" title="Redo (Ctrl+Shift+Z)" />
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <ToolbarButton icon={Bold} command="bold" title="Bold (Ctrl+B)" />
          <ToolbarButton icon={Italic} command="italic" title="Italic (Ctrl+I)" />
          <ToolbarButton icon={Underline} command="underline" title="Underline (Ctrl+U)" />
          <ToolbarButton icon={Strikethrough} command="strikeThrough" title="Strikethrough" />
          <ToolbarButton icon={Code} command="code" title="Inline Code" />
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <ToolbarButton icon={Heading1} command="formatBlock" value="h1" title="Heading 1" />
          <ToolbarButton icon={Heading2} command="formatBlock" value="h2" title="Heading 2" />
          <ToolbarButton icon={Heading3} command="formatBlock" value="h3" title="Heading 3" />
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
          <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
          <ToolbarButton icon={Quote} command="formatBlock" value="blockquote" title="Quote" />
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
          <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
          <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton icon={Link} onClick={handleLink} title="Insert Link" />
          <ToolbarButton icon={Image} onClick={handleImage} title="Insert Image" />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={() => onChange?.(editorRef.current?.innerHTML || '')}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: value }}
        placeholder={placeholder}
        style={{ minHeight }}
        className="prose prose-invert max-w-none p-4 focus:outline-none text-white placeholder-slate-500"
      />
    </div>
  );
}
