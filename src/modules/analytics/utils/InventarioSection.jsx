import React from 'react';
import { SectionLayout } from '../shared/SharedComponents';
import { CubeIcon } from 'react-native-heroicons/outline';

const InventarioSection = ({ data }) => {

  return (
    <SectionLayout
      title="Inventario"
      icon={<CubeIcon size={22} />}
      data={data}
    />
  );
};

export default InventarioSection;