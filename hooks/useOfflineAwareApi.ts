import { useDatabase } from '../contexts/DatabaseContext';

export function useOfflineAwareApi() {
  const { isDatabaseAvailable, isOnline, error } = useDatabase();

  const makeApiCall = async (apiCall: () => Promise<any>) => {
    if (!isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    if (!isDatabaseAvailable) {
      throw new Error('Database is currently unavailable. Please try again later.');
    }

    try {
      return await apiCall();
    } catch (err) {
      if (error) {
        console.warn('Database may be unavailable:', error);
      }
      throw err;
    }
  };

  return {
    makeApiCall,
    isOnline,
    isDatabaseAvailable,
    databaseError: error
  };
}
