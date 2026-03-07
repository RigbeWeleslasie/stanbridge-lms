import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function useStudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const enrollmentsRes = await api.get('/my-courses');
      const myEnrollments  = enrollmentsRes.data;
      setEnrollments(myEnrollments);

      const allAssignments = [];
      await Promise.all(myEnrollments.map(async (enrollment) => {
        try {
          const res = await api.get('/courses/' + enrollment.course_id + '/assignments');
          res.data.forEach(a => allAssignments.push({ ...a, course: enrollment.course }));
        } catch { }
      }));
      setAssignments(allAssignments);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const courses = enrollments.map(e => ({
    ...e.course,
    enrollment_status: e.status,
    enrolled_at: e.enrolled_at,
  }));

  return { courses, enrollments, assignments, loading, error, refetch: fetchData };
}
