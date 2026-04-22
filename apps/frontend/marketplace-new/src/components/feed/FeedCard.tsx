import { PostCard } from './PostCard';
import { ProductCard } from './ProductCard';
import { OfferCard } from './OfferCard';
import { LaunchCard } from './LaunchCard';
import { FeedbackCard } from './FeedbackCard';
import { RequirementCard } from './RequirementCard';
import type { FeedItem } from '../../services/marketplace.service';

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  switch (item.type) {
    case 'POST':        return <PostCard item={item} />;
    case 'PRODUCT':     return <ProductCard item={item} />;
    case 'OFFER':       return <OfferCard item={item} />;
    case 'LAUNCH':      return <LaunchCard item={item} />;
    case 'FEEDBACK':    return <FeedbackCard item={item} />;
    case 'REQUIREMENT': return <RequirementCard item={item} />;
    default:            return null;
  }
}
