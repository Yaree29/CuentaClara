import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import offersService from '../services/offersService';

const useOffers = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await offersService.getPromotions();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPromotions();
    }, [fetchPromotions])
  );

  const active = promotions.filter((p) => p.status === 'active' || p.status === 'scheduled');
  const past = promotions.filter((p) => p.status === 'expired');

  return { promotions, active, past, loading, refetch: fetchPromotions };
};

export default useOffers;
