import MultiLevelStockWidget from '../../inventory/widgets/MultiLevelStockWidget';
import ScaleScannerWidget from '../../inventory/widgets/ScaleScannerWidget';
import ShrinkageWidget from '../../inventory/widgets/ShrinkageWidget';
import RecipeMarginWidget from '../../recipes/widgets/RecipeMarginWidget';
import QuickScannerWidget from '../../sales/widgets/QuickScannerWidget';
import StaffCommissionsWidget from '../../services/widgets/StaffCommissionsWidget';
import FormalInvoiceWidget from '../../billing/widgets/FormalInvoiceWidget';
import GeneralBalanceWidget from '../../transactions/widgets/GeneralBalanceWidget';

export const PYME_DASHBOARDS_CONFIG = {
  alimentos: [
    { id: 'balance', Component: GeneralBalanceWidget },
    { id: 'scale_scanner', Component: ScaleScannerWidget },
    { id: 'shrinkage', Component: ShrinkageWidget },
    { id: 'formal_billing', Component: FormalInvoiceWidget }
  ],
  alimentos_preparados: [
    { id: 'balance', Component: GeneralBalanceWidget },
    { id: 'recipe_margin', Component: RecipeMarginWidget },
    { id: 'multi_stock', Component: MultiLevelStockWidget },
    { id: 'formal_billing', Component: FormalInvoiceWidget }
  ],
  comercio: [
    { id: 'balance', Component: GeneralBalanceWidget },
    { id: 'quick_scanner', Component: QuickScannerWidget },
    { id: 'multi_stock', Component: MultiLevelStockWidget },
    { id: 'formal_billing', Component: FormalInvoiceWidget }
  ],
  servicios: [
    { id: 'balance', Component: GeneralBalanceWidget },
    { id: 'staff_commissions', Component: StaffCommissionsWidget },
    { id: 'formal_billing', Component: FormalInvoiceWidget }
    // Inventario físico solo se renderizaría si el backend indica que venden productos
  ],
  general: [
    { id: 'balance', Component: GeneralBalanceWidget },
    { id: 'multi_stock', Component: MultiLevelStockWidget },
    { id: 'formal_billing', Component: FormalInvoiceWidget }
  ]
};