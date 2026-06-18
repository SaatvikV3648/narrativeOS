import { redirect } from 'next/navigation';

export default function PeerProfilesRedirectPage() {
  redirect('/dashboard/peer-benchmarks');
}
