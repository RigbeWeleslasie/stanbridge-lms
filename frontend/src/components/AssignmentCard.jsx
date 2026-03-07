export default function AssignmentCard({ assignment }) {
  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
          <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
        </div>
        <div className="text-right ml-4">
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
            {assignment.total_marks} marks
          </span>
          {assignment.due_date && (
            <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              {isOverdue ? 'Overdue' : ''} {new Date(assignment.due_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
