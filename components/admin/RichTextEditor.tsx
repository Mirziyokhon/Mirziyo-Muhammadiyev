"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Heading1,
  Heading2,
  Code,
  Link2,
  ImageIcon
} from 'lucide-react'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  token?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...', token }: RichTextEditorProps) {
  // Upload image to server
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#8B6F47] underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] max-w-none px-3 py-2',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false

        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.type.indexOf('image') === 0) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
              uploadImage(file).then((url) => {
                const { schema } = view.state
                const node = schema.nodes.image.create({ src: url })
                const transaction = view.state.tr.replaceSelectionWith(node)
                view.dispatch(transaction)
              }).catch((error) => {
                console.error('Failed to upload pasted image:', error)
              })
            }
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when prop changes (for editing existing content)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const MenuButton = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-muted/50 transition-colors ${
        active ? 'bg-muted text-[#8B6F47]' : ''
      }`}
      title={title}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background/50">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          active={editor.isActive('link')}
          title="Add Link"
        >
          <Link2 className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton
          onClick={() => {
            const url = window.prompt('Enter image URL:')
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
