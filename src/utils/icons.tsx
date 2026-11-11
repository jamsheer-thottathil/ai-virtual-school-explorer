import {
  Award,
  BookOpen,
  Bot,
  Brain,
  Building2,
  Camera,
  Compass,
  Cpu,
  DoorOpen,
  FlaskConical,
  Glasses,
  GraduationCap,
  History,
  Image as ImageIcon,
  Info,
  Leaf,
  Lightbulb,
  Map as MapIcon,
  MapPin,
  Medal,
  MessageCircle,
  Monitor,
  Music,
  Rocket,
  School,
  Sparkles,
  Star,
  Theater,
  Trophy,
  Users,
  Wand2,
  type LucideIcon
} from 'lucide-react';

/**
 * Icons that can be referenced by name from JSON files ("icon": "trophy").
 * Add more Lucide icons here if staff need new ones.
 */
const ICONS: Record<string, LucideIcon> = {
  award: Award,
  book: BookOpen,
  bot: Bot,
  brain: Brain,
  building: Building2,
  camera: Camera,
  compass: Compass,
  cpu: Cpu,
  door: DoorOpen,
  flask: FlaskConical,
  glasses: Glasses,
  graduation: GraduationCap,
  history: History,
  image: ImageIcon,
  info: Info,
  leaf: Leaf,
  lightbulb: Lightbulb,
  map: MapIcon,
  pin: MapPin,
  medal: Medal,
  chat: MessageCircle,
  monitor: Monitor,
  music: Music,
  rocket: Rocket,
  school: School,
  sparkles: Sparkles,
  star: Star,
  theater: Theater,
  trophy: Trophy,
  users: Users,
  wand: Wand2
};

export function getIcon(name: string | undefined): LucideIcon {
  return (name && ICONS[name.toLowerCase()]) || Sparkles;
}

export function DynamicIcon({
  name,
  size = 20,
  className
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const Icon = getIcon(name);
  return <Icon size={size} className={className} aria-hidden="true" />;
}
