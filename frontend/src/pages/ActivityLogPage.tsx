import { useEffect, useState } from 'react';
import { fetchActivityLogs, ActivityLog } from '../api/activityLogService';
import ActivityLogTable from '../components/ActivityLogTable';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchActivityLogs()
      .then(setLogs)
      .catch(console.error);
  }, []);

  const filteredLogs = logs.filter(log =>
    log.user.name.toLowerCase().includes(search.toLowerCase()) ||
    log.user.role.toLowerCase().includes(search.toLowerCase()) ||
    log.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filteredLogs.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate page numbers to show
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3);
    if (currentPage > 5 && currentPage < totalPages - 3) {
      pages.push('...');
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push('...');
    } else {
      pages.push('...');
    }
    pages.push(totalPages - 2, totalPages - 1, totalPages);
  }

 return (
    <div className="flex">
      <Sidebar />
      <main className="activity-log-main">
        <Header />
          <div className="log-header">
            <div>
              <h2>Transaction History</h2>
              <p>Total Items: {totalItems}</p>
            </div>
            <SearchBar value={search} onChange={setSearch} />
          </div>
        <ActivityLogTable logs={paginatedLogs} />

        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{ marginRight: '0.5rem' }}
          >
            &lt;
          </button>
          {pages.map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} style={{ margin: '0 0.25rem' }}>...</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                disabled={page === currentPage}
                style={{
                  margin: '0 0.25rem',
                  fontWeight: page === currentPage ? 'bold' : 'normal'
                }}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ marginLeft: '0.5rem' }}
          >
            &gt;
          </button>
        </div>
      </main>
    </div>
  );
}
