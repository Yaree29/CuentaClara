export const formatCurrency = (
  value = 0,
  currency = "USD"
) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};


export const calculateProgress = (
  current = 0,
  goal = 0
) => {
  if (!goal || goal <= 0) return 0;

  const percentage = (current / goal) * 100;

  return Math.min(
    Math.round(percentage),
    100
  );
};


export const calculateGrowth = (
  current = 0,
  previous = 0
) => {

  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(
    ((current - previous) / previous) * 100
  );
};


export const getGrowthLabel = (
  growth = 0
) => {

  if (growth > 0) {
    return `+${growth}% respecto al periodo anterior`;
  }

  if (growth < 0) {
    return `${growth}% respecto al periodo anterior`;
  }

  return "Sin cambios";
};


export const calculateSalesTotal = (
  sales = []
) => {

  return sales.reduce(
    (total, sale) =>
      total + Number(sale.total || 0),
    0
  );

};


export const calculateProductsSold = (
  sales = []
) => {

  return sales.reduce(
    (total, sale) => {

      const products =
        sale.products || [];

      const quantity =
        products.reduce(
          (sum, product) =>
            sum + Number(product.quantity || 0),
          0
        );

      return total + quantity;

    },
    0
  );

};


export const getBestSellingProduct = (
  sales = []
) => {

  const productCounter = {};


  sales.forEach((sale)=>{

    sale.products?.forEach(product=>{

      const name = product.name;

      if(!productCounter[name]){
        productCounter[name] = 0;
      }

      productCounter[name] +=
        Number(product.quantity || 0);

    });

  });


  const bestProduct =
    Object.entries(productCounter)
    .sort(
      (a,b)=>b[1]-a[1]
    )[0];


  if(!bestProduct){
    return null;
  }


  return {
    name: bestProduct[0],
    quantity: bestProduct[1]
  };

};


export const buildDashboardSummary = ({
  sales = [],
  previousSales = [],
  currency = "USD"
}) => {


  const totalSales =
    calculateSalesTotal(sales);


  const previousTotal =
    calculateSalesTotal(previousSales);


  return {

    totalSales,

    formattedSales:
      formatCurrency(
        totalSales,
        currency
      ),

    growth:
      calculateGrowth(
        totalSales,
        previousTotal
      ),

    growthLabel:
      getGrowthLabel(
        calculateGrowth(
          totalSales,
          previousTotal
        )
      ),

    productsSold:
      calculateProductsSold(
        sales
      ),

    bestProduct:
      getBestSellingProduct(
        sales
      )

  };

};


export const generateDashboardAlerts = ({
  inventory = [],
  sales = [],
  goals = {}
}) => {


  const alerts = [];


  const lowStock =
    inventory.filter(
      product =>
        Number(product.stock || 0)
        <= Number(product.minimumStock || 0)
    );


  if(lowStock.length){

    alerts.push({

      type:"inventory",

      title:"Inventario bajo",

      message:
        `${lowStock.length} productos necesitan reposición`

    });

  }

  if(
    goals.sales &&
    calculateSalesTotal(sales)
    <
    goals.sales
  ){

    alerts.push({

      type:"sales",

      title:"Meta pendiente",

      message:
        "Aún no alcanzas tu objetivo de ventas"

    });

  }


  return alerts;

};

export const buildSalesChartData = (
  salesByDay = []
) => {


  return {

    labels:
      salesByDay.map(
        item=>item.day
      ),

    datasets:[
      {
        data:
          salesByDay.map(
            item =>
              Number(item.total || 0)
          )
      }
    ]

  };

};