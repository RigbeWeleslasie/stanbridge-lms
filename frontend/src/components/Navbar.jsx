import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const roleColors = {
    student:  'bg-indigo-100 text-indigo-700',
    lecturer: 'bg-green-100 text-green-700',
    admin:    'bg-red-100 text-red-700',
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-700">Stanbridge LMS</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${roleColors[user?.role]}`}>
            {user?.role}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
