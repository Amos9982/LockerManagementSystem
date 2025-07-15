import { ActivityLog } from '../api/activityLogService';

type Props = { logs: ActivityLog[] };

const roleDisplayMap: Record<string, string> = {
  INVESTIGATOR: 'Investigator',
  CASE_STORE_OFFICER: 'Case Store Officer',
  SUPER_ADMIN: 'Super Admin',
};

export default function ActivityLogTable({ logs }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>User</th>
          <th>Role</th>
          <th>Locker</th>
          <th>Activity</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <tr key={index}>
            <td>{new Date(log.timestamp).toLocaleString()}</td>
            <td>{log.user.name}</td>
            <td>{roleDisplayMap[log.user.role] || log.user.role}</td>
            <td>{log.locker.number}</td>
            <td className={`activity-${log.type.toLowerCase()}`}>{log.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
