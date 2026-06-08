import React from 'react';
import useUserStore from '../../../store/useUserStore';
import InformalInventory from '../components/InformalInventory';
import PymeInventoryScreen from '../../../../pyme/inventory/screens/PymeInventoryScreen';

const InventoryScreen = () => {
  const userType = useUserStore((state) => state.userType);

  return userType === 'pyme' ? <PymeInventoryScreen /> : <InformalInventory />;
};

export default InventoryScreen;
