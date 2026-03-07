import { useState } from 'react';

export default function SemestersTab({ semesters, onCreateSemester, onUpdateSemester, onDeleteSemester }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [message, setMessage]   = useState('');
  const [form, setForm]         = useState({
    name: '', start_date: '', end_date: '',
    enrollment_start: '', enrollment_end: '', is_active: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await onUpdateSemester(editId, form);
        setMessage('Semester updated!');
      } else {
        await onCreateSemester(form);
        setMessage('Semester created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', start_date: '', end_date: '', enrollment_start: '', enrollment_end: '', is_active: false });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({
      name:             s.name,
      start_date:       s.start_date?.split('T')[0],
      end_date:         s.end_date?.split('T')[0],
      enrollment_start: s.enrollment_start?.split('T')[0] || '',
      enrollment_end:   s.enrollment_end?.split('T')[0] || '',
      is_active:        s.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this semester?')) return;
    try {
      await onDeleteSemester(id);
      setMessage('Semester deleted!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Semesters</h2>
          <p className="text-sm text-gray-500 mt-1">Manage academic terms and enrollment periods</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition">
          + New Semester
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('!') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{message}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            {editId ? 'Edit Semester' : 'Create New Semester'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. Semester 1 2026" required
              className={inputClass} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Semester Start</label>
                <input type="date" value={form.start_date}
                  onChange={e => setForm({...form, start_date: e.target.value})} required
                  className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Semester End</label>
                <input type="date" value={form.end_date}
                  onChange={e => setForm({...form, end_date: e.target.value})} required
                  className={inputClass} />
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Enrollment Period
              </p>
              <p className="text-xs text-gray-500">
                Students can only request enrollment during this window.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Enrollment Opens</label>
                  <input type="date" value={form.enrollment_start}
                    onChange={e => setForm({...form, enrollment_start: e.target.value})}
                    className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Enrollment Deadline</label>
                  <input type="date" value={form.enrollment_end}
                    onChange={e => setForm({...form, enrollment_end: e.target.value})}
                    className={inputClass} />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm({...form, is_active: e.target.checked})} />
              Set as active semester
            </label>

            <div className="flex gap-2">
              <button type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                {editId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {semesters.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No semesters yet. Create your first semester!
        </div>
      ) : (
        <div className="space-y-4">
          {semesters.map(semester => (
            <div key={semester.id}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800">{semester.name}</h4>
                    {semester.is_active && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                    {semester.enrollment_open && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Enrollment Open
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Semester Period</p>
                      <p>{new Date(semester.start_date).toLocaleDateString()} — {new Date(semester.end_date).toLocaleDateString()}</p>
                    </div>
                    {semester.enrollment_start && (
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Enrollment Period</p>
                        <p>{new Date(semester.enrollment_start).toLocaleDateString()} — {new Date(semester.enrollment_end).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(semester)}
                    className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(semester.id)}
                    className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
