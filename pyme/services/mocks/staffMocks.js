export const staffMock = [
  {
    name: 'Juan',
    service: 'Cortes',
    completed: 5,
    commission: 25,
  },
  {
    name: 'Ana',
    service: 'Uñas',
    completed: 3,
    commission: 30,
  },
];

export const servicesSummaryMock = {
  totalServices: staffMock.reduce((total, member) => total + member.completed, 0),
  totalCommissions: staffMock.reduce((total, member) => total + member.commission, 0),
  activeStaff: staffMock.length,
};
