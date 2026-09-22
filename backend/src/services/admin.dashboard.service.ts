import * as dashboardRepository from '../repositories/admin.dashboard.repository';

export const getDashboardStats = async () => {
  return dashboardRepository.getDashboardStats();
};
