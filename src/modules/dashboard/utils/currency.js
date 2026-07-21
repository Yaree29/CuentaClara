/**
 * ./utils/currency.js
 *
 * Utilidades para manejo de monedas
 * dentro del Dashboard PYME.
 *
 * No maneja estado.
 * Solo contiene configuraciones y funciones
 * relacionadas con dinero.
 */


/**
 * Monedas soportadas por la aplicación
 *
 * Puede crecer cuando se agreguen
 * más países.
 */
export const CURRENCIES = {

  USD: {
    code: "USD",
    symbol: "$",
    name: "Dólar estadounidense",
    locale: "en-US"
  },


  PAB: {
    code: "PAB",
    symbol: "B/.",
    name: "Balboa panameño",
    locale: "es-PA"
  },


  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "es-ES"
  },


  COP: {
    code: "COP",
    symbol: "$",
    name: "Peso colombiano",
    locale: "es-CO"
  }

};



/**
 * Obtiene configuración de una moneda
 */
export const getCurrencyConfig = (
  currency = "USD"
) => {

  return (
    CURRENCIES[currency]
    ||
    CURRENCIES.USD
  );

};



/**
 * Formatea números como moneda
 *
 * Ejemplo:
 *
 * formatMoney(1500,"USD")
 *
 * Resultado:
 * $1,500.00
 */
export const formatMoney = (
  value = 0,
  currency = "USD"
) => {


  const config =
    getCurrencyConfig(currency);



  return new Intl.NumberFormat(
    config.locale,
    {
      style:"currency",
      currency:config.code,
      minimumFractionDigits:2
    }
  )
  .format(
    Number(value || 0)
  );

};



/**
 * Formato compacto
 *
 * Útil para tarjetas del dashboard
 *
 * Ejemplo:
 * 1500000
 *
 * Resultado:
 * $1.5M
 */
export const formatCompactMoney = (
  value = 0,
  currency = "USD"
) => {


  const config =
    getCurrencyConfig(currency);



  return new Intl.NumberFormat(
    config.locale,
    {
      notation:"compact",
      style:"currency",
      currency:config.code,
      maximumFractionDigits:1
    }
  )
  .format(
    Number(value || 0)
  );

};



/**
 * Obtiene solamente el símbolo
 *
 * Ejemplo:
 *
 * getCurrencySymbol("USD")
 *
 * retorna "$"
 */
export const getCurrencySymbol = (
  currency = "USD"
) => {

  return getCurrencyConfig(currency)
    .symbol;

};



/**
 * Convierte texto monetario
 *
 * Ejemplo:
 *
 * "$1,500.00"
 *
 * retorna:
 * 1500
 */
export const parseMoney = (
  value
) => {


  if(
    typeof value === "number"
  ){
    return value;
  }


  if(!value){
    return 0;
  }


  const parsed =
    String(value)
      .replace(
        /[^0-9.-]+/g,
        ""
      );


  return Number(parsed) || 0;

};



/**
 * Calcula porcentaje monetario
 *
 * Usado para:
 * crecimiento de ventas
 * márgenes
 * indicadores
 */
export const calculateMoneyPercentage = (
  amount = 0,
  total = 0
) => {


  if(
    total <= 0
  ){
    return 0;
  }


  return Math.round(
    (amount / total) * 100
  );

};



/**
 * Suma lista de valores monetarios
 *
 * Ejemplo:
 *
 * [
 *  {total:10},
 *  {total:20}
 * ]
 *
 * retorna:
 * 30
 */
export const sumMoneyValues = (
  items = [],
  field = "total"
) => {


  return items.reduce(
    (sum,item)=>
      sum +
      Number(
        item[field] || 0
      ),
    0
  );

};



/**
 * Devuelve monedas disponibles
 *
 * Para dropdowns de configuración
 */
export const getAvailableCurrencies = () => {


  return Object.values(
    CURRENCIES
  );

};