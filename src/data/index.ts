import { patients } from './patients';
import { doctors } from './doctors';
import { appointments } from './appointments';
import { bills } from './billing';
import { medicines } from './pharmacy';
import { labTests } from './laboratory';
import { 
  aiInsights, 
  dashboardStats, 
  revenueChartData, 
  patientDemographics,
  departmentDistribution,
  recentActivities,
  aiAgents
} from './aiMockData';
import { roles } from './roles';

export { patients } from './patients';
export { doctors } from './doctors';
export { appointments } from './appointments';
export { bills } from './billing';
export { medicines } from './pharmacy';
export { labTests } from './laboratory';
export { 
  aiInsights, 
  dashboardStats, 
  revenueChartData, 
  patientDemographics,
  departmentDistribution,
  recentActivities,
  aiAgents
} from './aiMockData';
export { roles } from './roles';

// Export all data as a single object for easy access
export const db = {
  patients,
  doctors,
  appointments,
  bills,
  medicines,
  labTests,
  aiInsights,
  aiAgents,
  dashboardStats,
  revenueChartData,
  patientDemographics,
  departmentDistribution,
  recentActivities,
  roles
};
