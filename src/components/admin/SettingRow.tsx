import { useTranslation } from 'react-i18next'
import { SettingDefinition } from '../../api/adminSettings'
import { StarIcon, LockIcon, RefreshIcon } from './icons'
import { SettingInput } from './SettingInput'
import { Toggle } from './Toggle'
import { formatSettingKey, stripHtml } from './utils'

interface SettingRowProps {
  setting: SettingDefinition
  isFavorite: boolean
  onToggleFavorite: () => void
  onUpdate: (value: string) => void
  onReset: () => void
  isUpdating?: boolean
  isResetting?: boolean
}

export function SettingRow({
  setting,
  isFavorite,
  onToggleFavorite,
  onUpdate,
  onReset,
  isUpdating,
  isResetting
}: SettingRowProps) {
  const { t } = useTranslation()

  const formattedKey = formatSettingKey(setting.name || setting.key)
  const displayName = t(`admin.settings.settingNames.${formattedKey}`, formattedKey)
  const description = setting.hint?.description ? stripHtml(setting.hint.description) : null

  // Check if this is a long/complex value
  const isLongValue = (() => {
    const val = String(setting.current ?? '')
    const key = setting.key.toLowerCase()
    return (
      val.length > 50 ||
      val.includes('\n') ||
      val.startsWith('[') ||
      val.startsWith('{') ||
      key.includes('_items') ||
      key.includes('_config') ||
      key.includes('_keywords') ||
      key.includes('_template') ||
      key.includes('_packages')
    )
  })()

  return (
    <div className="group p-4 sm:p-5 rounded-2xl bg-dark-800/40 border border-dark-700/40 hover:border-dark-600/60 hover:bg-dark-800/60 transition-all">
      {/* Header row - name, badges, favorite */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-dark-100 text-base">{displayName}</h3>
            {setting.has_override && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-warning-500/20 text-warning-400 font-medium">
                {t('admin.settings.modified')}
              </span>
            )}
            {setting.read_only && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-dark-600/50 text-dark-400 font-medium flex items-center gap-1">
                <LockIcon />
                {t('admin.settings.readOnly')}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-dark-400 mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={onToggleFavorite}
          className={`p-2 rounded-xl transition-all flex-shrink-0 ${
            isFavorite
              ? 'text-warning-400 bg-warning-500/15 hover:bg-warning-500/25'
              : 'text-dark-500 hover:text-warning-400 hover:bg-dark-700/50 opacity-0 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          <StarIcon filled={isFavorite} />
        </button>
      </div>

      {/* Setting key (muted) */}
      <div className="mb-3">
        <code className="text-xs text-dark-500 font-mono bg-dark-900/50 px-2 py-1 rounded">
          {setting.key}
        </code>
      </div>

      {/* Control section */}
      <div className={`${isLongValue ? '' : 'flex items-center justify-between gap-3'} pt-3 border-t border-dark-700/30`}>
        {setting.read_only ? (
          // Read-only display
          <div className="flex items-center gap-2 text-dark-300 bg-dark-700/30 rounded-lg px-4 py-2.5">
            <span className="font-mono text-sm break-all">{String(setting.current ?? '-')}</span>
          </div>
        ) : setting.type === 'bool' ? (
          // Boolean toggle
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-dark-400">
              {setting.current === true || setting.current === 'true' ? 'Включено' : 'Выключено'}
            </span>
            <div className="flex items-center gap-2">
              <Toggle
                checked={setting.current === true || setting.current === 'true'}
                onChange={() => onUpdate(setting.current === true || setting.current === 'true' ? 'false' : 'true')}
                disabled={isUpdating}
              />
              {/* Reset button for boolean */}
              {setting.has_override && (
                <button
                  onClick={onReset}
                  disabled={isResetting}
                  className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors disabled:opacity-50"
                  title={t('admin.settings.reset')}
                >
                  <RefreshIcon />
                </button>
              )}
            </div>
          </div>
        ) : (
          // Input field
          <div className={`${isLongValue ? 'w-full' : 'flex items-center gap-2 flex-1 justify-end'}`}>
            <SettingInput
              setting={setting}
              onUpdate={onUpdate}
              disabled={isUpdating}
            />
            {/* Reset button for non-long values */}
            {!isLongValue && setting.has_override && (
              <button
                onClick={onReset}
                disabled={isResetting}
                className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors disabled:opacity-50 flex-shrink-0"
                title={t('admin.settings.reset')}
              >
                <RefreshIcon />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reset button for long values - shown below */}
      {isLongValue && setting.has_override && !setting.read_only && setting.type !== 'bool' && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onReset}
            disabled={isResetting}
            className="px-3 py-1.5 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors disabled:opacity-50 text-sm flex items-center gap-1.5"
            title={t('admin.settings.reset')}
          >
            <RefreshIcon />
            <span>Сбросить</span>
          </button>
        </div>
      )}
    </div>
  )
}
