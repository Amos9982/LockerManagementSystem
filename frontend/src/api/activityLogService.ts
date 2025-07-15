export type ActivityLog = {
  id: string;
  userId: string;
  lockerId: string;
  type: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
  };
  locker: {
    number: number;
  };
};

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const res = await fetch('http://localhost:3000/dev/activity/activityLog');

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to fetch activity logs');
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response format');
  }

  return data;
}
