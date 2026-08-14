import {
  Star, Heart, Smile, ThumbsUp, Crown, Cat, Dog, Circle, Flag, Droplet,
  CheckCircle2, Lightbulb, Trophy, Cloud, Zap, Pen, Skull, LucideIcon
} from 'lucide-react';

export const RATING_SHAPES: { id: string; icon: LucideIcon }[] = [
  { id: 'star', icon: Star },
  { id: 'heart', icon: Heart },
  { id: 'smile', icon: Smile },
  { id: 'thumbs_up', icon: ThumbsUp },
  { id: 'crown', icon: Crown },
  { id: 'cat', icon: Cat },
  { id: 'dog', icon: Dog },
  { id: 'circle', icon: Circle },
  { id: 'flag', icon: Flag },
  { id: 'droplet', icon: Droplet },
  { id: 'check_circle', icon: CheckCircle2 },
  { id: 'lightbulb', icon: Lightbulb },
  { id: 'trophy', icon: Trophy },
  { id: 'cloud', icon: Cloud },
  { id: 'zap', icon: Zap },
  { id: 'pen', icon: Pen },
  { id: 'skull', icon: Skull },
];

export default function RatingIcon({ shape, className, ...props }: { shape?: string, className?: string, [key: string]: any }) {
  const ShapeIcon = RATING_SHAPES.find(s => s.id === shape)?.icon || Star;
  return <ShapeIcon className={className} {...props} />;
}
