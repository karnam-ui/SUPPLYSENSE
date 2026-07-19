import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
const POLL_INTERVAL = 10000; // 10 seconds

const useAPI = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        timeout: 5000,
        ...options,
      });
      setData(response.data);
      setError(null);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
};

export default useAPI;
