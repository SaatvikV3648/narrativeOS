import { redirect } from 'next/navigation';

export const dynamic = "force-dynamic";

export default function MonthlyPlanPage() {
  redirect('/dashboard/roadmap');
}
