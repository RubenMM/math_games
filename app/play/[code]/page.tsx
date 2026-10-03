import PlayScreen from '@/components/session/PlayScreen';

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <PlayScreen code={(await params).code} />;
}
