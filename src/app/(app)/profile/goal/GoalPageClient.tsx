'use client';

import { useRouter } from 'next/navigation';
import GoalEditor from '@/components/profile/GoalEditor';
import type { UserProfile, Goal } from '@/types/profile';

interface Props {
  userId: string;
  profile: UserProfile;
  activeGoal: Goal | null;
}

export default function GoalPageClient({ userId, profile, activeGoal }: Props) {
  const router = useRouter();

  function handleSave(_goal: Goal) {
    router.push('/profile');
  }

  function handleCancel() {
    router.push('/profile');
  }

  return (
    <GoalEditor
      userId={userId}
      currentGoal={activeGoal}
      userProfile={profile}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
