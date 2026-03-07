import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function EnrollmentsTab() {
  const [pending, setPending]   = useState([]);
  const [all, setAll]           = useState([]);
  const [view, setView]         = useState('pending');
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        api.get('/admin/enrollments/pending'),
        api.get('/admin/enrollments'),
      ]);
      setPending(pendingRes.data);
      setAll(allRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/enrollments/${id}/approve`);
      showMessage('Enrollment approved!');
      fetchData();
    } catch (err) {
      showMessage('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/enrollments/${id}/reject`);
      showMessage('Enrollment rejected.');
      fetchData();
    } catch (err) {
      showMessage('Failed to reject');
    }
  };

  const displayed = view === 'pending'
    ? pending
    : view === 'active'  ? all.filter(e => e.status === 'active')
    : view === 'rejected' ? all.filter(e => e.status === 'rejected')
    : all;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Enrollment Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve student enrollment requests</p>
        </div>
        {pending.length > 0 && (
          <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
            {pending.length} pending
          </span>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{message}</div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'pending',  label: `Pending (${pending.length})` },
          { key: 'active',   label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'all',      label: 'All' },
        ].map(f => (
          <button key={f.key} onClick={() => setView(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              view === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading...</div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200">
          <p className="text-gray-400">
            {view === 'pending' ? 'No pending requests!' : 'No enrollments found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(enrollment => (
            <div key={enrollment.id}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                  {enrollment.student?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{enrollment.student?.name}</p>
                  <p className="text-xs text-gray-400">{enrollment.student?.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {enrollment.course?.title}
                    </span>
                    <span className="text-xs text-gray-400">{enrollment.course?.code}</span>
                    <span className="text-xs text-gray-400">
                      {enrollment.course?.lecturer?.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      enrollment.status === 'active'   ? 'bg-green-100 text-green-700' :
                      enrollment.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                </div>
              </div>

              {enrollment.status === 'pending' && (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleApprove(enrollment.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-lg transition">
                    Approve
                  </button>
                  <button onClick={() => handleReject(enrollment.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 text-sm px-4 py-1.5 rounded-lg transition">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
