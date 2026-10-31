import React from 'react';
import { Check, X } from 'lucide-react';
import { SpyLocation } from '../types';
import { StyleTokens } from '../theme/tokens';
import { TEXTS } from '../texts';
import { LocationIcon } from './LocationIcon';

interface LocationsGridProps {
  locations: SpyLocation[];
  tokens: StyleTokens;
  /** Если передан — сетка работает в режиме выбора локации шпионом */
  selectable?: boolean;
  selectedId?: string | null;
  disabledIds?: string[];
  onSelect?: (locationId: string) => void;
}

export const LocationsGrid: React.FC<LocationsGridProps> = ({
  locations,
  tokens,
  selectable = false,
  selectedId = null,
  disabledIds = [],
  onSelect,
}) => {
  return (
    <div
      data-testid="spy-locations"
      className="grid grid-cols-2 gap-2"
    >
      {locations.map((loc) => {
        const isAlreadyGuessed = disabledIds.includes(loc.id);
        const isSelected = selectedId === loc.id;

        if (!selectable) {
          return (
            <div
              key={loc.id}
              data-testid={`spy-location-${loc.id}`}
              className={`min-h-[56px] p-2.5 flex items-start gap-2.5 ${tokens.surfaceBg} ${tokens.controlRadius}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tokens.surfaceMutedBg} ${tokens.textSecondary}`}
              >
                <LocationIcon icon={loc.icon} className="w-4 h-4" />
              </div>
              <span
                className={`text-[13px] font-semibold leading-snug break-words min-w-0 ${tokens.textPrimary}`}
              >
                {loc.name}
              </span>
            </div>
          );
        }

        return (
          <button
            key={loc.id}
            type="button"
            data-testid={`spy-location-${loc.id}`}
            disabled={isAlreadyGuessed}
            onClick={() => onSelect?.(loc.id)}
            className={`min-h-[60px] p-2.5 text-left flex items-start gap-2 transition-transform ${
              tokens.controlRadius
            } ${
              isAlreadyGuessed
                ? `${tokens.surfaceMutedBg} opacity-50 cursor-not-allowed`
                : isSelected
                  ? `${tokens.accentSoftBg} ring-2 ring-current ${tokens.accentText}`
                  : `${tokens.surfaceBg} hover:opacity-95 active:scale-[0.98]`
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? tokens.primaryBtn + ' ' + tokens.primaryBtnText : tokens.surfaceMutedBg + ' ' + tokens.textSecondary
              }`}
            >
              {isSelected ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <LocationIcon icon={loc.icon} className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className={`text-[13px] font-semibold leading-snug break-words ${tokens.textPrimary}`}>
                {loc.name}
              </p>
              {isAlreadyGuessed && (
                <p className={`mt-0.5 text-[13px] ${tokens.textMuted}`}>
                  {TEXTS.modals.alreadyGuessed}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

interface LocationsModalProps {
  open: boolean;
  locations: SpyLocation[];
  tokens: StyleTokens;
  onClose: () => void;
}

export const LocationsModal: React.FC<LocationsModalProps> = ({
  open,
  locations,
  tokens,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={TEXTS.modals.locationsTitle}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/55"
    >
      <div
        className={`max-h-[85%] flex flex-col ${tokens.canvasBg} rounded-t-3xl border-t ${tokens.borderSubtle} shadow-2xl`}
      >
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-black/5 dark:border-white/10">
          <div className="min-w-0">
            <h2 className={`font-display text-lg font-bold ${tokens.textPrimary}`}>
              {TEXTS.modals.locationsTitle}
            </h2>
            <p className={`text-[13px] ${tokens.textSecondary}`}>
              {TEXTS.modals.locationsSubtitle(locations.length)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={TEXTS.common.close}
            className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${tokens.secondaryBtn} ${tokens.secondaryBtnText} ${tokens.controlRadius} shrink-0`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 pb-6">
          <LocationsGrid locations={locations} tokens={tokens} />
        </div>
      </div>
    </div>
  );
};
