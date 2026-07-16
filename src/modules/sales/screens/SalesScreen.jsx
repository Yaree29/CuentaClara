import React from 'react';
import useUserStore from '../../../store/useUserStore';

import SalesInformal from '../components/screens/salesInformal';
import SalesPyme from '../components/screens/salesPyme';

const SalesScreen = () => {
  const userType = useUserStore((state) => state.userType);

  if (userType === 'simple') {
    return <SalesInformal />;
  }

  return <SalesPyme />;
};

export default SalesScreen;