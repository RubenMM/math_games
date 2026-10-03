import { Suspense } from 'react';
import JoinForm from '@/components/session/JoinForm';

export default function Page() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
