export default function StatCard({ label, value, color }) {
  const colors = {
    indigo: 'text-indigo-600',
    yellow: 'text-yellow-500',
    green:  'text-green-500',
    red:    'text-red-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color] || colors.indigo}`}>
        {value}
      </p>
    </div>
  );
}
