import React from 'react';
import { SectionLayout } from '../shared/SharedComponents';
import { ChartBarIcon } from 'react-native-heroicons/outline';

const VentasSection = ({ data }) => {

  return (
    <SectionLayout
      title="Ventas"
      icon={<ChartBarIcon size={22} />}
      data={data}
    />
  );
};

export default VentasSection;