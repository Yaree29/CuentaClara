/**
 * progress.js
 *
 * Utilidades para calcular y manejar
 * indicadores de progreso del Dashboard PYME.
 *
 * No maneja estado.
 * Solo realiza cálculos y devuelve información
 * lista para ser utilizada por componentes.
 */


/**
 * Calcula porcentaje de progreso
 *
 * Ejemplo:
 *
 * actual: 750
 * objetivo: 1000
 *
 * retorna:
 * 75
 */
export const calculateProgress = (
  actual = 0,
  goal = 0
) => {

  if(
    !goal ||
    goal <= 0
  ){
    return 0;
  }


  const percentage =
    (actual / goal) * 100;


  return Math.min(
    Math.round(percentage),
    100
  );

};



/**
 * Calcula progreso sin limitarlo a 100
 *
 * Útil cuando queremos saber
 * si una meta fue superada.
 *
 * Ejemplo:
 *
 * ventas: 1500
 * meta: 1000
 *
 * retorna:
 * 150
 */
export const calculateRawProgress = (
  actual = 0,
  goal = 0
) => {

  if(
    !goal ||
    goal <= 0
  ){
    return 0;
  }


  return Math.round(
    (actual / goal) * 100
  );

};



/**
 * Determina estado del progreso
 *
 * Estados:
 *
 * completed
 * warning
 * danger
 * normal
 */
export const getProgressStatus = (
  percentage = 0
) => {


  if(
    percentage >= 100
  ){
    return "completed";
  }


  if(
    percentage >= 70
  ){
    return "normal";
  }


  if(
    percentage >= 40
  ){
    return "warning";
  }


  return "danger";

};



/**
 * Obtiene etiqueta visual
 */
export const getProgressLabel = (
  percentage = 0
) => {


  if(
    percentage >= 100
  ){
    return "Meta alcanzada";
  }


  if(
    percentage >= 70
  ){
    return "Buen progreso";
  }


  if(
    percentage >= 40
  ){
    return "En progreso";
  }


  return "Necesita atención";

};



/**
 * Calcula cuánto falta para alcanzar
 * una meta.
 *
 * Ejemplo:
 *
 * meta:1000
 * actual:700
 *
 * retorna:
 * 300
 */
export const calculateRemaining = (
  actual = 0,
  goal = 0
) => {


  const remaining =
    goal - actual;


  return Math.max(
    remaining,
    0
  );

};



/**
 * Calcula diferencia sobre objetivo
 *
 * Ejemplo:
 *
 * actual:1200
 * meta:1000
 *
 * retorna:
 * +200
 */
export const calculateOverAchievement = (
  actual = 0,
  goal = 0
) => {


  if(
    actual <= goal
  ){
    return 0;
  }


  return actual - goal;

};



/**
 * Genera objeto completo
 * para tarjetas de progreso
 *
 * Utilizado por:
 * GoalProgressCard
 */
export const buildProgressData = ({
  current = 0,
  target = 0,
  label = "Progreso"
}) => {


  const percentage =
    calculateProgress(
      current,
      target
    );


  return {

    label,

    current,

    target,

    percentage,

    status:
      getProgressStatus(
        percentage
      ),

    statusLabel:
      getProgressLabel(
        percentage
      ),

    remaining:
      calculateRemaining(
        current,
        target
      ),

    exceeded:
      calculateOverAchievement(
        current,
        target
      )

  };

};



/**
 * Calcula progreso de múltiples metas
 *
 * Ejemplo:
 *
 * [
 *  {
 *    current:800,
 *    target:1000
 *  },
 *  {
 *    current:50,
 *    target:100
 *  }
 * ]
 */
export const calculateMultipleProgress = (
  goals = []
) => {


  return goals.map(
    goal =>
      buildProgressData(
        goal
      )
  );

};



/**
 * Determina color lógico del progreso
 *
 * El componente decide cómo pintar.
 * Aquí solo enviamos estado.
 */
export const getProgressVariant = (
  percentage = 0
) => {


  if(
    percentage >= 100
  ){
    return "success";
  }


  if(
    percentage >= 50
  ){
    return "primary";
  }


  return "danger";

};