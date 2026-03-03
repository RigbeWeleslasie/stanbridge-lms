import { useAuth } from '../../context/AuthContext';

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-700">Lecturer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600">Logout</button>
          </div>
        </div>
        <p className="text-gray-500">Welcome! Your courses and submissions will appear here.</p>
      </div>
    </div>
  );
}
