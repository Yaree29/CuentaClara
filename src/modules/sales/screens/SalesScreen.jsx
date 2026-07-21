import React from 'react';
import useAuthStore from '../../../store/useAuthStore';

import SalesInformal from '../components/screens/salesInformal';
import SalesPyme from '../components/screens/salesPyme';

const SalesScreen = () => {
  const user = useAuthStore((state) => state.user);

  const uiMode = user?.business?.ui_mode;

  if (uiMode === 'simple') {
    return <SalesInformal />;
  }

  return <SalesPyme />;
};

export default SalesScreen;