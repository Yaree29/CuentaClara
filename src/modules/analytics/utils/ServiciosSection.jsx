import React from 'react';
import { SectionLayout } from '../shared/SharedComponents';
import { WrenchScrewdriverIcon } from 'react-native-heroicons/outline';

const ServiciosSection = ({ data }) => {

  return (
    <SectionLayout
      title="Servicios"
      icon={<WrenchScrewdriverIcon size={22} />}
      data={data}
    />
  );
};

export default ServiciosSection;