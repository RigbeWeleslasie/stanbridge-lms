import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function useAdminDashboard() {
  const [students, setStudents]     = useState([]);
  const [lecturers, setLecturers]   = useState([]);
  const [courses, setCourses]       = useState([]);
  const [semesters, setSemesters]   = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes, semestersRes, enrollmentsRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/courses'),
        api.get('/semesters'),
        api.get('/admin/enrollments'),
      ]);

      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      setSemesters(semestersRes.data);
      setEnrollments(enrollmentsRes.data);

      // get lecturers from users
      const usersRes = await api.get('/admin/users');
      setLecturers(usersRes.data.filter(u => u.role === 'lecturer'));

      // fetch all submissions
      const allSubmissions = [];
      await Promise.all(coursesRes.data.map(async (course) => {
        try {
          const assignmentsRes = await api.get(`/courses/${course.id}/assignments`);
          await Promise.all(assignmentsRes.data.map(async (assignment) => {
            try {
              const subsRes = await api.get(`/assignments/${assignment.id}/submissions`);
              subsRes.data.forEach(sub => {
                allSubmissions.push({ ...sub, assignment, course });
              });
            } catch { }
          }));
        } catch { }
      }));
      setSubmissions(allSubmissions);
    } catch (err) {
      setError('Failed to load admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Semester actions
  const createSemester = async (data) => {
    try {
      await api.post('/semesters', data);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create semester');
    }
  };

  const updateSemester = async (id, data) => {
    try {
      await api.put(`/semesters/${id}`, data);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update semester');
    }
  };

  const deleteSemester = async (id) => {
    try {
      await api.delete(`/semesters/${id}`);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete semester');
    }
  };

  // Course actions
  const createCourse = async (data) => {
    try {
      await api.post('/courses', data);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create course');
    }
  };

  const updateCourse = async (id, data) => {
    try {
      await api.put(`/courses/${id}`, data);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update course');
    }
  };

  const deleteCourse = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  // Enrollment actions
  const enrollStudent = async (userId, courseId) => {
    try {
      await api.post('/admin/enroll', { user_id: userId, course_id: courseId });
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to enroll student');
    }
  };

  const bulkEnroll = async (userIds, courseId) => {
    try {
      const res = await api.post('/admin/enroll/bulk', {
        user_ids: userIds, course_id: courseId,
      });
      await fetchData();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to bulk enroll');
    }
  };

  const unenrollStudent = async (userId, courseId) => {
    try {
      await api.delete('/admin/enroll', {
        data: { user_id: userId, course_id: courseId },
      });
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to unenroll student');
    }
  };

  const gradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await api.put(`/submissions/${submissionId}/grade`, { grade, feedback });
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to grade');
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status !== 'graded');
  const gradedSubmissions  = submissions.filter(s => s.status === 'graded');
  const activeSemester     = semesters.find(s => s.is_active);

  return {
    students, lecturers, courses, semesters,
    enrollments, submissions,
    pendingSubmissions, gradedSubmissions,
    activeSemester, loading, error,
    createSemester, updateSemester, deleteSemester,
    createCourse, updateCourse, deleteCourse,
    enrollStudent, bulkEnroll, unenrollStudent,
    gradeSubmission, refetch: fetchData,
  };
}
