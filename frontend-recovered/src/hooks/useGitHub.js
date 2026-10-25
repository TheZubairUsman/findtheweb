import { useState, useEffect } from 'react';

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

const getCachedData = (key) => {
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }
  return null;
};

const setCachedData = (key, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

export const useGitHubUser = (username) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const cacheKey = `github-user-${username}`;
      
      // Check cache first
      const cached = getCachedData(cacheKey);
      if (cached) {
        setUserData(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Rate limit exceeded');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCachedData(cacheKey, data);
        setUserData(data);
      } catch (err) {
        console.error('Error fetching GitHub user:', err);
        setError(err.message);
        setUserData({
          name: 'Loading...',
          avatar_url: '',
          html_url: `https://github.com/${username}`
        });
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  return { userData, loading, error };
};

export const useGitHubRepo = (owner, repo) => {
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepo = async () => {
      const cacheKey = `github-repo-${owner}-${repo}`;
      
      // Check cache first
      const cached = getCachedData(cacheKey);
      if (cached) {
        setRepoData(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Rate limit exceeded');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCachedData(cacheKey, data);
        setRepoData(data);
      } catch (err) {
        console.error('Error fetching GitHub repo:', err);
        setError(err.message);
        setRepoData({
          stargazers_count: '--',
          html_url: `https://github.com/${owner}/${repo}`
        });
      } finally {
        setLoading(false);
      }
    };

    if (owner && repo) {
      fetchRepo();
    }
  }, [owner, repo]);

  return { repoData, loading, error };
};
