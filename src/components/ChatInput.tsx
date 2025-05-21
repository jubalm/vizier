import { useRef, useEffect, forwardRef, useImperativeHandle, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils'

export interface ChatInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isBusy?: boolean
  maxLines?: number
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ isBusy, maxLines = 6, className, onKeyDown, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useImperativeHandle(ref, () => textareaRef.current!, [textareaRef])

    function updateTextareaLayout() {
      const textarea = textareaRef.current
      if (!textarea) return
      // Set max-height CSS variable
      const computed = window.getComputedStyle(textarea)
      const lineHeight = parseFloat(computed.lineHeight)
      const maxHeight = lineHeight * maxLines
      textarea.style.setProperty('--chatinput-max-height', `${maxHeight}px`)
      // Autosize
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }

    useEffect(updateTextareaLayout, [props.value, maxLines])

    // Enhanced onKeyDown: submit parent form on Enter (without Shift/Cmd)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.metaKey) {
        const textarea = textareaRef.current
        if (textarea && textarea.form) {
          e.preventDefault()
          if (typeof textarea.form.requestSubmit === 'function') {
            textarea.form.requestSubmit()
          } else {
            textarea.form.submit()
          }
        }
      }
      // Always call user-provided onKeyDown (after our logic)
      if (onKeyDown) onKeyDown(e)
    }

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          // Layout and appearance
          'flex-1 rounded bg-transparent px-2 py-1 border-none focus:ring-0 outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-0',
          // Autosize styles to compliment updateTextareaLayout
          'h-auto overflow-auto max-h-[var(--chatinput-max-height)]',
          className
        )}
        disabled={isBusy}
        rows={1}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
ChatInput.displayName = 'ChatInput'
