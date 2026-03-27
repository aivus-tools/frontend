import { PublicOfferView } from '@/modules/PublicOffer/PublicOfferView';

export default function PublicOfferPage({ params }: { params: Promise<{ token: string }> }) {
  return <PublicOfferView params={params} />;
}
