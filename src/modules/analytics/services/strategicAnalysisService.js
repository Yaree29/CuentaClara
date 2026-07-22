import { strategicAnalysisMock } from './mock';


export const getStrategicAnalysis = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(strategicAnalysisMock);
    }, 800);
  });
};