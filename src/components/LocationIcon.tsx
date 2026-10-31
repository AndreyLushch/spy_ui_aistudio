import React from 'react';
import {
  Anchor,
  Briefcase,
  Building2,
  Car,
  Clapperboard,
  Cloud,
  Compass,
  Dices,
  Drama,
  Dumbbell,
  Flame,
  Globe,
  KeyRound,
  Landmark,
  Laptop,
  MapPin,
  Mountain,
  Music,
  Palette,
  Plane,
  Radio,
  Rocket,
  Shield,
  Ship,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sun,
  TrainFront,
  Trees,
  Utensils,
  Wine,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ship: Ship,
  rocket: Rocket,
  hotel: Building2,
  wine: Wine,
  drama: Drama,
  dice: Dices,
  snowflake: Snowflake,
  clapperboard: Clapperboard,
  train: TrainFront,
  landmark: Landmark,
  anchor: Anchor,
  palette: Palette,
  globe: Globe,
  mountain: Mountain,
  briefcase: Briefcase,
  laptop: Laptop,
  compass: Compass,
  radio: Radio,
  plane: Plane,
  dumbbell: Dumbbell,
  car: Car,
  utensils: Utensils,
  key: KeyRound,
  music: Music,
  sun: Sun,
  cloud: Cloud,
  sparkles: Sparkles,
  trees: Trees,
  'shopping-bag': ShoppingBag,
  flame: Flame,
  shield: Shield,
};

interface LocationIconProps {
  icon?: string;
  className?: string;
}

export const LocationIcon: React.FC<LocationIconProps> = ({ icon, className = 'w-5 h-5' }) => {
  if (!icon) {
    return <MapPin className={className} aria-hidden="true" />;
  }

  const LucideComp = ICON_MAP[icon];
  if (LucideComp) {
    return <LucideComp className={className} aria-hidden="true" />;
  }

  // Если передан символ эмодзи или произвольный ключ-заглушка
  if (icon.length <= 3) {
    return (
      <span className="text-base leading-none select-none" aria-hidden="true">
        {icon}
      </span>
    );
  }

  return <MapPin className={className} aria-hidden="true" />;
};
