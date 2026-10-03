import HostScreen from '@/components/session/HostScreen';

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <HostScreen code={(await params).code} />;
}
