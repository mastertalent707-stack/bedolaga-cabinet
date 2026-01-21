import { useState, useRef, useEffect } from 'react'
import { SettingDefinition } from '../../api/adminSettings'
import { CheckIcon, CloseIcon, EditIcon } from './icons'

interface SettingInputProps {
  setting: SettingDefinition
  onUpdate: (value: string) => void
  disabled?: boolean
}

// Check if value is likely JSON or multi-line
function isLongValue(value: string | null | undefined): boolean {
  if (!value) return false
  const str = String(value)
  return str.length > 50 || str.includes('\n') || str.startsWith('[') || str.startsWith('{')
}

// Check if key suggests it's a list or JSON config
function isListOrJsonKey(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return (
    lowerKey.includes('_items') ||
    lowerKey.includes('_config') ||
    lowerKey.includes('_keywords') ||
    lowerKey.includes('_list') ||
    lowerKey.includes('_json') ||
    lowerKey.includes('_template') ||
    lowerKey.includes('_periods') ||
    lowerKey.includes('_discounts') ||
    lowerKey.includes('_packages')
  )
}

export function SettingInput({ setting, onUpdate, disabled }: SettingInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentValue = String(setting.current ?? '')
  const needsTextarea = isLongValue(currentValue) || isListOrJsonKey(setting.key)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px'
    }
  }, [value, isEditing])

  const handleStart = () => {
    setValue(currentValue)
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate(value)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setValue('')
  }

  // Dropdown for choices
  if (setting.choices && setting.choices.length > 0) {
    return (
      <select
        value={currentValue}
        onChange={(e) => onUpdate(e.target.value)}
        disabled={disabled}
        className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 disabled:opacity-50 min-w-[140px] cursor-pointer"
      >
        {setting.choices.map((choice, idx) => (
          <option key={idx} value={String(choice.value)}>
            {choice.label}
          </option>
        ))}
      </select>
    )
  }

  // Editing mode - Textarea for long values
  if (isEditing && needsTextarea) {
    return (
      <div className="w-full space-y-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancel()
            // Ctrl+Enter to save
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave()
          }}
          autoFocus
          placeholder="Введите значение..."
          className="w-full bg-dark-700 border border-accent-500 rounded-xl px-4 py-3 text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent-500/30 font-mono resize-none min-h-[100px]"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-dark-500">Ctrl+Enter для сохранения</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 transition-colors text-sm"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors text-sm flex items-center gap-1.5"
            >
              <CheckIcon />
              Сохранить
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Editing mode - Regular input
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type={setting.type === 'int' || setting.type === 'float' ? 'number' : 'text'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
          autoFocus
          placeholder="Введите значение..."
          className="bg-dark-700 border border-accent-500 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-accent-500/30 w-48 sm:w-56"
        />
        <button
          onClick={handleSave}
          className="p-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors"
          title="Сохранить (Enter)"
        >
          <CheckIcon />
        </button>
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 transition-colors"
          title="Отмена (Esc)"
        >
          <CloseIcon />
        </button>
      </div>
    )
  }

  // Display mode - Long value preview
  if (needsTextarea) {
    const displayValue = currentValue || '-'
    const previewValue = displayValue.length > 60 ? displayValue.slice(0, 60) + '...' : displayValue

    return (
      <button
        onClick={handleStart}
        disabled={disabled}
        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-sm text-dark-200 hover:border-dark-500 hover:bg-dark-700 transition-colors disabled:opacity-50 text-left font-mono group"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="break-all line-clamp-2 flex-1">{previewValue}</span>
          <span className="text-dark-500 group-hover:text-accent-400 transition-colors flex-shrink-0">
            <EditIcon />
          </span>
        </div>
      </button>
    )
  }

  // Display mode - Short value
  return (
    <button
      onClick={handleStart}
      disabled={disabled}
      className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-200 hover:border-dark-500 hover:bg-dark-600 transition-colors disabled:opacity-50 min-w-[100px] text-left font-mono truncate max-w-[200px] flex items-center gap-2 group"
    >
      <span className="truncate flex-1">{currentValue || '-'}</span>
      <span className="text-dark-500 group-hover:text-accent-400 transition-colors opacity-0 group-hover:opacity-100">
        <EditIcon />
      </span>
    </button>
  )
}
