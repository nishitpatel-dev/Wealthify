import { useState } from "react";

const useFetch = (cb) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    try {
      const response = await cb(...args);      
      setData(response);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
