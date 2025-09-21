import React from 'react';
import { Settings } from 'lucide-react';
import { Workout, WorkoutStats } from '../types/workout';
import StatsGrid from './StatsGrid';
import WeeklyChart from './WeeklyChart';
import RecentWorkouts from './RecentWorkouts';
import QuickActions from './QuickActions';

interface DashboardProps {
  loading: boolean;
  stats: WorkoutStats | null;
  getRecentWorkouts: (limit: number) => Workout[];
  saveWorkout: (workout: Workout) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ loading, stats, getRecentWorkouts, saveWorkout }) => {
  const [dashboardLayout, setDashboardLayout] = React.useState(() => {
    const saved = localStorage.getItem('dashboard_layout');
    return saved ? JSON.parse(saved) : ['stats', 'progress', 'recent', 'actions'];
  });
  
  const [showCustomization, setShowCustomization] = React.useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const recentWorkouts = getRecentWorkouts(3);

  const saveDashboardLayout = (newLayout: string[]): void => {
    setDashboardLayout(newLayout);
    localStorage.setItem('dashboard_layout', JSON.stringify(newLayout));
  };

  const availableWidgets = [
    { id: 'stats', name: 'Statistics', component: 'StatsGrid' },
    { id: 'progress', name: 'Weekly Progress', component: 'WeeklyChart' },
    { id: 'recent', name: 'Recent Workouts', component: 'RecentWorkouts' },
    { id: 'actions', name: 'Quick Actions', component: 'QuickActions' }
  ];

  const renderWidget = (widgetId: string): React.ReactNode => {
    switch (widgetId) {
      case 'stats': return <StatsGrid stats={stats} />;
      case 'progress': return <WeeklyChart stats={stats} />;
      case 'recent': return <RecentWorkouts recentWorkouts={recentWorkouts} />;
      case 'actions': return <QuickActions saveWorkout={saveWorkout} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-center py-4 flex-1">
          <h1 className="text-3xl font-bold mb-2 p-4 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg animate-pulse">
            Big Dick Energie
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Track your fitness journey</p>
        </div>
        <button
          onClick={() => setShowCustomization(!showCustomization)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Customize Dashboard"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Dashboard Customization */}
      {showCustomization && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customize Dashboard</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableWidgets.map(widget => (
              <label key={`widget-${widget.id}`} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dashboardLayout.includes(widget.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      saveDashboardLayout([...dashboardLayout, widget.id]);
                    } else {
                      saveDashboardLayout(dashboardLayout.filter((id: string) => id !== widget.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{widget.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Dashboard Layout */}
      <div className="space-y-6">
        {dashboardLayout.map((widgetId: string, index: number) => (
          <div key={`widget-${widgetId}-${index}`}>
            {renderWidget(widgetId)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
