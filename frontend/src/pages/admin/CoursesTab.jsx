import { useState } from 'react';

export default function CoursesTab({ courses, lecturers, semesters, onCreateCourse, onUpdateCourse, onDeleteCourse }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [message, setMessage]   = useState('');
  const [form, setForm]         = useState({
    title: '', code: '', description: '',
    lecturer_id: '', semester_id: '', status: 'active',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await onUpdateCourse(editId, form);
        setMessage('Course updated!');
      } else {
        await onCreateCourse(form);
        setMessage('Course created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ title: '', code: '', description: '', lecturer_id: '', semester_id: '', status: 'active' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (course) => {
    setEditId(course.id);
    setForm({
      title:       course.title,
      code:        course.code,
      description: course.description || '',
      lecturer_id: course.lecturer_id,
      semester_id: course.semester_id || '',
      status:      course.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course? All assignments and submissions will be lost!')) return;
    try {
      await onDeleteCourse(id);
      setMessage('Course deleted!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Courses</h2>
          <p className="text-sm text-gray-500 mt-1">Create courses and assign lecturers</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition">
          + New Course
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
            {editId ? 'Edit Course' : 'Create New Course'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Course Title" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <input value={form.code}
                onChange={e => setForm({...form, code: e.target.value})}
                placeholder="Course Code (e.g. CS101)" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <textarea value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Course Description" rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Assign Lecturer</label>
                <select value={form.lecturer_id}
                  onChange={e => setForm({...form, lecturer_id: e.target.value})} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Select Lecturer</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Semester</label>
                <select value={form.semester_id}
                  onChange={e => setForm({...form, semester_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">No Semester</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Status</label>
                <select value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
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

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          No courses yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Course</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Code</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Lecturer</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Semester</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, i) => (
                <tr key={course.id} className={i < courses.length - 1 ? 'border-b border-gray-50' : ''}>
                  <td className="px-5 py-3 font-medium text-gray-800">{course.title}</td>
                  <td className="px-5 py-3 text-gray-500">{course.code}</td>
                  <td className="px-5 py-3 text-gray-500">{course.lecturer?.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{course.semester?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      course.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>{course.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(course)}
                        className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded-lg">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(course.id)}
                        className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
