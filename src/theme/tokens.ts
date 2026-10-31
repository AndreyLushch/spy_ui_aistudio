/**
 * Централизованные дизайн-токены интерфейса «Шпион».
 *
 * Раздел 7 ТЗ:
 * 1) Три стилевых направления для экранов «раздача», «ход» и «голосование»:
 *    - `dossier` («Досье "Отель Гранд"») — основной доведённый стиль для всей игры:
 *      ироничный шпионский триллер (тёплая архивная бумага / графитовый бархат, латунный штамп).
 *    - `casino` («Полночь в Монте-Карло») — альтернативный клубный стиль (глубокое сукно и золото).
 *    - `express` («Дипломатический экспресс») — альтернативный редакционный стиль (индиго и сургуч).
 * 2) Светлая и тёмная темы для игры и при дневном свете, и в полутёмном баре.
 * 3) Строгое равенство ролей: ни один токен не зависит от роли игрока (житель / шпион).
 */

export type ThemeMode = 'light' | 'dark';
export type StyleVariant = 'dossier' | 'casino' | 'express';

export interface StyleTokens {
  id: StyleVariant;
  name: string;
  subtitle: string;
  isPrimary: boolean;
  /** Фон экрана телефона (60% нейтральный холст) */
  canvasBg: string;
  /** Поверхность карточек и табло (30% структурные поверхности) */
  surfaceBg: string;
  surfaceMutedBg: string;
  surfaceElevatedBg: string;
  /** Тонкие разделители (без двойных рамок) */
  borderSubtle: string;
  borderStrong: string;
  /** Типографика */
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** Главный акцент (10% бюджет акцента — одинаковый у жителя и шпиона) */
  primaryBtn: string;
  primaryBtnText: string;
  secondaryBtn: string;
  secondaryBtnText: string;
  /** Кнопка «Ва-банк» — заметно рискованная, но требующая подтверждения */
  riskBtn: string;
  riskBtnText: string;
  /** Карта роли (конверт/досье): строго одинаковая рамка и фон для обеих ролей */
  dossierBg: string;
  dossierBorder: string;
  dossierStampText: string;
  dossierProgressFill: string;
  /** Состояния голосования и таймера */
  accentText: string;
  accentSoftBg: string;
  dangerText: string;
  dangerSoftBg: string;
  successText: string;
  successSoftBg: string;
  /** Геометрия скруглений */
  cardRadius: string;
  controlRadius: string;
}

export const STYLE_VARIANTS_META: Array<{
  id: StyleVariant;
  name: string;
  badge: string;
  description: string;
}> = [
  {
    id: 'dossier',
    name: 'Досье «Отель Гранд»',
    badge: 'Основной',
    description: 'Тёплая папка-досье, латунно-янтарный акцент, лёгкая ирония шпионской комедии. Доведён на всех экранах.',
  },
  {
    id: 'casino',
    name: 'Полночь в Монте-Карло',
    badge: 'Вариант 2',
    description: 'Благородный изумрудно-сланцевый клубный стол, шампань и мягкая геометрия вечернего салона.',
  },
  {
    id: 'express',
    name: 'Дипломатический экспресс',
    badge: 'Вариант 3',
    description: 'Швейцарская телеграфная чёткость, чернильный кобальт, строгие углы и контрастные карточки.',
  },
];

export const TOKENS: Record<StyleVariant, Record<ThemeMode, StyleTokens>> = {
  dossier: {
    light: {
      id: 'dossier',
      name: 'Досье «Отель Гранд»',
      subtitle: 'Светлая тема',
      isPrimary: true,
      canvasBg: 'bg-[#F6F4EF] text-[#18181B]',
      surfaceBg: 'bg-[#FFFFFF] border border-[#E5E0D5]',
      surfaceMutedBg: 'bg-[#EFECE4]',
      surfaceElevatedBg: 'bg-[#FFFFFF] shadow-lg shadow-stone-900/10 border border-[#E5E0D5]',
      borderSubtle: 'border-[#E5E0D5]',
      borderStrong: 'border-[#CFC7B8]',
      textPrimary: 'text-[#18181B]',
      textSecondary: 'text-[#4A4740]',
      textMuted: 'text-[#716D64]',
      primaryBtn: 'bg-[#1C1917] hover:bg-[#292524] active:scale-[0.98]',
      primaryBtnText: 'text-[#FAF8F5]',
      secondaryBtn: 'bg-[#ECE8DF] hover:bg-[#E2DDD1] active:scale-[0.98]',
      secondaryBtnText: 'text-[#1C1917]',
      riskBtn: 'bg-[#FFF5F2] hover:bg-[#FFEAE4] border border-[#E29578] active:scale-[0.98]',
      riskBtnText: 'text-[#9A3412]',
      dossierBg: 'bg-[#FFFDF8]',
      dossierBorder: 'border-2 border-[#B45309]/40 shadow-xl shadow-amber-950/10',
      dossierStampText: 'text-[#B45309]',
      dossierProgressFill: 'bg-[#B45309]',
      accentText: 'text-[#B45309]',
      accentSoftBg: 'bg-[#FEF3C7]/70',
      dangerText: 'text-[#B91C1C]',
      dangerSoftBg: 'bg-[#FEE2E2]/80',
      successText: 'text-[#15803D]',
      successSoftBg: 'bg-[#DCFCE7]/80',
      cardRadius: 'rounded-2xl',
      controlRadius: 'rounded-xl',
    },
    dark: {
      id: 'dossier',
      name: 'Досье «Отель Гранд»',
      subtitle: 'Тёмная тема',
      isPrimary: true,
      canvasBg: 'bg-[#121316] text-[#F4F3EF] tracking-[0.005em]',
      surfaceBg: 'bg-[#1B1D22] border border-[#2B2E36]',
      surfaceMutedBg: 'bg-[#23262E]',
      surfaceElevatedBg: 'bg-[#1E2026] shadow-xl shadow-black/50 border border-[#323640]',
      borderSubtle: 'border-[#2B2E36]',
      borderStrong: 'border-[#3E434F]',
      textPrimary: 'text-[#F4F3EF]',
      textSecondary: 'text-[#C4C2BA]',
      textMuted: 'text-[#8E8C84]',
      primaryBtn: 'bg-[#F59E0B] hover:bg-[#FBBF24] active:scale-[0.98]',
      primaryBtnText: 'text-[#141311]',
      secondaryBtn: 'bg-[#262932] hover:bg-[#2F333E] active:scale-[0.98]',
      secondaryBtnText: 'text-[#F4F3EF]',
      riskBtn: 'bg-[#2C1A19] hover:bg-[#38201E] border border-[#C2410C]/70 active:scale-[0.98]',
      riskBtnText: 'text-[#FDBA74]',
      dossierBg: 'bg-[#1B1D22]',
      dossierBorder: 'border-2 border-[#F59E0B]/50 shadow-2xl shadow-black/60',
      dossierStampText: 'text-[#FBBF24]',
      dossierProgressFill: 'bg-[#F59E0B]',
      accentText: 'text-[#FBBF24]',
      accentSoftBg: 'bg-[#F59E0B]/15',
      dangerText: 'text-[#FCA5A5]',
      dangerSoftBg: 'bg-[#EF4444]/15',
      successText: 'text-[#86EFAC]',
      successSoftBg: 'bg-[#22C55E]/15',
      cardRadius: 'rounded-2xl',
      controlRadius: 'rounded-xl',
    },
  },
  casino: {
    light: {
      id: 'casino',
      name: 'Полночь в Монте-Карло',
      subtitle: 'Светлая тема',
      isPrimary: false,
      canvasBg: 'bg-[#F2F6F4] text-[#0F1F1A]',
      surfaceBg: 'bg-[#FFFFFF] border border-[#D6E2DC]',
      surfaceMutedBg: 'bg-[#E6EFEA]',
      surfaceElevatedBg: 'bg-[#FFFFFF] shadow-lg shadow-emerald-950/10 border border-[#D6E2DC]',
      borderSubtle: 'border-[#D6E2DC]',
      borderStrong: 'border-[#B8CCC2]',
      textPrimary: 'text-[#0F1F1A]',
      textSecondary: 'text-[#354F46]',
      textMuted: 'text-[#617A71]',
      primaryBtn: 'bg-[#0F4C3A] hover:bg-[#145E48] active:scale-[0.98]',
      primaryBtnText: 'text-[#F7FAF8]',
      secondaryBtn: 'bg-[#E3EDE8] hover:bg-[#D5E3DC] active:scale-[0.98]',
      secondaryBtnText: 'text-[#0F2921]',
      riskBtn: 'bg-[#FDF4F3] hover:bg-[#FCE8E6] border border-[#D9776C] active:scale-[0.98]',
      riskBtnText: 'text-[#991B1B]',
      dossierBg: 'bg-[#FAFCFB]',
      dossierBorder: 'border-2 border-[#0F4C3A]/45 shadow-xl shadow-emerald-950/10',
      dossierStampText: 'text-[#0F4C3A]',
      dossierProgressFill: 'bg-[#0F4C3A]',
      accentText: 'text-[#0F5132]',
      accentSoftBg: 'bg-[#D1FAE5]/70',
      dangerText: 'text-[#B91C1C]',
      dangerSoftBg: 'bg-[#FEE2E2]/80',
      successText: 'text-[#047857]',
      successSoftBg: 'bg-[#D1FAE5]/80',
      cardRadius: 'rounded-3xl',
      controlRadius: 'rounded-2xl',
    },
    dark: {
      id: 'casino',
      name: 'Полночь в Монте-Карло',
      subtitle: 'Тёмная тема',
      isPrimary: false,
      canvasBg: 'bg-[#0C1714] text-[#ECF4F0] tracking-[0.005em]',
      surfaceBg: 'bg-[#13241F] border border-[#223B33]',
      surfaceMutedBg: 'bg-[#192F29]',
      surfaceElevatedBg: 'bg-[#152822] shadow-xl shadow-black/50 border border-[#28463D]',
      borderSubtle: 'border-[#223B33]',
      borderStrong: 'border-[#33574C]',
      textPrimary: 'text-[#ECF4F0]',
      textSecondary: 'text-[#B6CBC2]',
      textMuted: 'text-[#7C998E]',
      primaryBtn: 'bg-[#EAB308] hover:bg-[#FACC15] active:scale-[0.98]',
      primaryBtnText: 'text-[#111A16]',
      secondaryBtn: 'bg-[#1C342D] hover:bg-[#244239] active:scale-[0.98]',
      secondaryBtnText: 'text-[#ECF4F0]',
      riskBtn: 'bg-[#2D181A] hover:bg-[#3A1E21] border border-[#DC2626]/60 active:scale-[0.98]',
      riskBtnText: 'text-[#FCA5A5]',
      dossierBg: 'bg-[#13241F]',
      dossierBorder: 'border-2 border-[#EAB308]/45 shadow-2xl shadow-black/60',
      dossierStampText: 'text-[#FDE047]',
      dossierProgressFill: 'bg-[#EAB308]',
      accentText: 'text-[#FDE047]',
      accentSoftBg: 'bg-[#EAB308]/15',
      dangerText: 'text-[#FCA5A5]',
      dangerSoftBg: 'bg-[#EF4444]/15',
      successText: 'text-[#6EE7B7]',
      successSoftBg: 'bg-[#10B981]/15',
      cardRadius: 'rounded-3xl',
      controlRadius: 'rounded-2xl',
    },
  },
  express: {
    light: {
      id: 'express',
      name: 'Дипломатический экспресс',
      subtitle: 'Светлая тема',
      isPrimary: false,
      canvasBg: 'bg-[#F4F6FA] text-[#111827]',
      surfaceBg: 'bg-[#FFFFFF] border border-[#DCE2EE]',
      surfaceMutedBg: 'bg-[#E9EEF6]',
      surfaceElevatedBg: 'bg-[#FFFFFF] shadow-lg shadow-slate-900/10 border border-[#DCE2EE]',
      borderSubtle: 'border-[#DCE2EE]',
      borderStrong: 'border-[#BEC9DE]',
      textPrimary: 'text-[#111827]',
      textSecondary: 'text-[#374151]',
      textMuted: 'text-[#6B7280]',
      primaryBtn: 'bg-[#1E3A8A] hover:bg-[#1D4ED8] active:scale-[0.98]',
      primaryBtnText: 'text-[#FFFFFF]',
      secondaryBtn: 'bg-[#E6ECF5] hover:bg-[#DAE3F0] active:scale-[0.98]',
      secondaryBtnText: 'text-[#111827]',
      riskBtn: 'bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#EF4444]/60 active:scale-[0.98]',
      riskBtnText: 'text-[#991B1B]',
      dossierBg: 'bg-[#FFFFFF]',
      dossierBorder: 'border-2 border-[#1E3A8A]/50 shadow-xl shadow-blue-950/10',
      dossierStampText: 'text-[#1E3A8A]',
      dossierProgressFill: 'bg-[#1E3A8A]',
      accentText: 'text-[#1E40AF]',
      accentSoftBg: 'bg-[#DBEAFE]/80',
      dangerText: 'text-[#B91C1C]',
      dangerSoftBg: 'bg-[#FEE2E2]/80',
      successText: 'text-[#15803D]',
      successSoftBg: 'bg-[#DCFCE7]/80',
      cardRadius: 'rounded-xl',
      controlRadius: 'rounded-lg',
    },
    dark: {
      id: 'express',
      name: 'Дипломатический экспресс',
      subtitle: 'Тёмная тема',
      isPrimary: false,
      canvasBg: 'bg-[#0E131F] text-[#F1F5F9] tracking-[0.005em]',
      surfaceBg: 'bg-[#161E2E] border border-[#263248]',
      surfaceMutedBg: 'bg-[#1E293B]',
      surfaceElevatedBg: 'bg-[#192336] shadow-xl shadow-black/50 border border-[#2F3E59]',
      borderSubtle: 'border-[#263248]',
      borderStrong: 'border-[#3B4C6B]',
      textPrimary: 'text-[#F1F5F9]',
      textSecondary: 'text-[#CBD5E1]',
      textMuted: 'text-[#94A3B8]',
      primaryBtn: 'bg-[#38BDF8] hover:bg-[#7DD3FC] active:scale-[0.98]',
      primaryBtnText: 'text-[#0B1120]',
      secondaryBtn: 'bg-[#222F46] hover:bg-[#2B3B57] active:scale-[0.98]',
      secondaryBtnText: 'text-[#F1F5F9]',
      riskBtn: 'bg-[#2C1820] hover:bg-[#3A1F29] border border-[#F43F5E]/60 active:scale-[0.98]',
      riskBtnText: 'text-[#FDA4AF]',
      dossierBg: 'bg-[#161E2E]',
      dossierBorder: 'border-2 border-[#38BDF8]/50 shadow-2xl shadow-black/60',
      dossierStampText: 'text-[#7DD3FC]',
      dossierProgressFill: 'bg-[#38BDF8]',
      accentText: 'text-[#7DD3FC]',
      accentSoftBg: 'bg-[#38BDF8]/15',
      dangerText: 'text-[#FDA4AF]',
      dangerSoftBg: 'bg-[#F43F5E]/15',
      successText: 'text-[#86EFAC]',
      successSoftBg: 'bg-[#22C55E]/15',
      cardRadius: 'rounded-xl',
      controlRadius: 'rounded-lg',
    },
  },
};

export function getTokens(style: StyleVariant, theme: ThemeMode): StyleTokens {
  return TOKENS[style][theme];
}
