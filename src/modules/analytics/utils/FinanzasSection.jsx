import React from 'react';
import { SectionLayout } from '../shared/SharedComponents';
import { CurrencyDollarIcon } from 'react-native-heroicons/outline';

const FinanzasSection = ({ data }) => {

  return (
    <SectionLayout
      title="Finanzas"
      icon={<CurrencyDollarIcon size={22} />}
      data={data}
    />
  );
};

export default FinanzasSection;