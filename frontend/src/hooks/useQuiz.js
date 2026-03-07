import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export default function useQuiz(courseId) {
  const [quizzes, setQuizzes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (courseId) fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/${courseId}/quizzes`);
      setQuizzes(res.data);
    } catch (err) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startAttempt = async (quizId) => {
    try {
      const res = await api.post(`/quizzes/${quizId}/attempt`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  const submitAttempt = async (attemptId, answers) => {
    try {
      const res = await api.post(`/attempts/${attemptId}/submit`, { answers });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const getMyAttempt = async (quizId) => {
    try {
      const res = await api.get(`/quizzes/${quizId}/my-attempt`);
      return res.data;
    } catch (err) {
      return null;
    }
  };

  return {
    quizzes,
    loading,
    error,
    startAttempt,
    submitAttempt,
    getMyAttempt,
    refetch: fetchQuizzes,
  };
}
