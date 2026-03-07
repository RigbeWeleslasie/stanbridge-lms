import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function useLecturerDashboard() {
  const [courses, setCourses]         = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents]       = useState({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const coursesRes = await api.get('/courses');
      const myCourses  = coursesRes.data;
      setCourses(myCourses);

      if (myCourses.length === 0) {
        setSubmissions([]);
        setAssignments([]);
        setStudents({});
        return;
      }

      const allSubmissions = [];
      const allAssignments = [];
      const allStudents    = {};

      await Promise.all(myCourses.map(async (course) => {
        try {
          const [assignmentsRes, studentsRes] = await Promise.all([
            api.get(`/courses/${course.id}/assignments`),
            api.get(`/courses/${course.id}/students`),
          ]);

          allStudents[course.id] = studentsRes.data;

          assignmentsRes.data.forEach(a => {
            allAssignments.push({ ...a, course });
          });

          console.log(`Course ${course.id} assignments:`, assignmentsRes.data);

          await Promise.all(assignmentsRes.data.map(async (assignment) => {
            try {
              const subsRes = await api.get(`/assignments/${assignment.id}/submissions`);
              console.log(`Assignment ${assignment.id} submissions:`, subsRes.data);
              subsRes.data.forEach(sub => {
                allSubmissions.push({ ...sub, assignment, course });
              });
            } catch (e) {
              console.warn(`No submissions for assignment ${assignment.id}`, e.response?.data);
            }
          }));
        } catch (e) {
          console.warn(`Error fetching course ${course.id}:`, e.response?.data);
        }
      }));

      console.log('All assignments:', allAssignments);
      console.log('All submissions:', allSubmissions);

      setAssignments(allAssignments);
      setSubmissions(allSubmissions);
      setStudents(allStudents);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (data) => {
    try {
      await api.post('/courses', data);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create course');
    }
  };

  const createAssignment = async (courseId, data) => {
    try {
      await api.post(`/courses/${courseId}/assignments`, data);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const gradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await api.put(`/submissions/${submissionId}/grade`, { grade, feedback });
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to grade submission');
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status !== 'graded');
  const gradedSubmissions  = submissions.filter(s => s.status === 'graded');
  const totalStudents      = Object.values(students).reduce((acc, s) => acc + s.length, 0);

  return {
    courses, assignments, submissions,
    pendingSubmissions, gradedSubmissions,
    students, totalStudents,
    loading, error,
    createCourse, createAssignment, gradeSubmission,
    refetch: fetchData,
  };
}
