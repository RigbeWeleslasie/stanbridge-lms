import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function useQuizBuilder(courseId) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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

  const createQuiz = async (data) => {
    try {
      const res = await api.post(`/courses/${courseId}/quizzes`, data);
      await fetchQuizzes();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create quiz');
    }
  };

  const addQuestion = async (quizId, data) => {
    try {
      const res = await api.post(`/quizzes/${quizId}/questions`, data);
      await fetchQuizzes();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add question');
    }
  };

  const togglePublish = async (quizId) => {
    try {
      const res = await api.put(`/quizzes/${quizId}/publish`);
      await fetchQuizzes();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to publish quiz');
    }
  };

  const deleteQuiz = async (quizId) => {
    try {
      await api.delete(`/quizzes/${quizId}`);
      await fetchQuizzes();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const getResults = async (quizId) => {
    try {
      const res = await api.get(`/quizzes/${quizId}/results`);
      return res.data;
    } catch (err) {
      throw new Error('Failed to load results');
    }
  };

  return {
    quizzes,
    loading,
    error,
    createQuiz,
    addQuestion,
    togglePublish,
    deleteQuiz,
    getResults,
    refetch: fetchQuizzes,
  };
}
