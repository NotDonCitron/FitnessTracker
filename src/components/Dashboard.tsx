import React from 'react';
import { Activity, Clock, TrendingUp, Calendar, Dumbbell, Target, Settings, BarChart3 } from 'lucide-react';

const Dashboard = ({ loading, stats, getRecentWorkouts, saveWorkout }) => {
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

  const saveDashboardLayout = (newLayout) => {
    setDashboardLayout(newLayout);
    localStorage.setItem('dashboard_layout', JSON.stringify(newLayout));
  };

  const availableWidgets = [
    { id: 'stats', name: 'Statistics', component: 'StatsGrid' },
    { id: 'progress', name: 'Weekly Progress', component: 'WeeklyChart' },
    { id: 'recent', name: 'Recent Workouts', component: 'RecentWorkouts' },
    { id: 'actions', name: 'Quick Actions', component: 'QuickActions' }
  ];

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4" style={{ borderLeftColor: color }}>
     <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
       <div className={`p-2 rounded-lg bg-opacity-20 mb-3 sm:mb-0`} style={{ backgroundColor: color }}>
          {icon}
        </div>
       <div className="sm:ml-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
         <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const StatsGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        icon={<Dumbbell className="h-6 w-6 text-blue-600" />}
        title="Total Workouts"
        value={stats?.totalWorkouts || 0}
        color="#3B82F6"
      />
      
      <StatCard
        icon={<Clock className="h-6 w-6 text-green-600" />}
        title="Total Time"
        value={formatDuration(stats?.totalDuration || 0)}
        subtitle="Hours trained"
        color="#10B981"
      />
      
      <StatCard
        icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
        title="Average Workout"
        value={formatDuration(Math.round(stats?.averageDuration || 0))}
        subtitle="Per session"
        color="#8B5CF6"
      />
    </div>
  );

  const WeeklyChart = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
        Weekly Progress
      </h3>
      <div className="flex items-end justify-between h-32 bg-gray-50 dark:bg-gray-700 rounded p-4">
        {stats?.weeklyProgress.map((count, index) => {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const maxCount = Math.max(...(stats?.weeklyProgress || [1]), 1);
          const height = (count / maxCount) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{days[index]}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const RecentWorkouts = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-green-600" />
        Recent Workouts
      </h3>
      
      {recentWorkouts.length > 0 ? (
        <div className="space-y-3">
          {recentWorkouts.map((workout) => (
            <div key={workout.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{workout.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(workout.date).toLocaleDateString()} • {formatDuration(workout.duration)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {workout.sets.length} exercises • {workout.sets.filter(s => s.completed).length} sets completed
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <Target className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No workouts yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Start your first workout to see progress here</p>
        </div>
      )}
    </div>
  );

  const QuickActions = () => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => {
            const workout = {
              id: Date.now().toString(),
              name: `Workout ${new Date().toLocaleDateString()}`,
              date: new Date().toISOString(),
              duration: 0,
              sets: [],
              completed: false
            };
            saveWorkout(workout);
            
            const event = new CustomEvent('changeTab', { detail: { tab: 'workout' } });
            window.dispatchEvent(event);
          }}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all duration-200"
        >
          <Dumbbell className="h-6 w-6 mb-2" />
          <div className="font-medium">Start Workout</div>
          <div className="text-sm opacity-90">Begin tracking exercises</div>
        </button>
        <button 
          onClick={() => {
            const event = new CustomEvent('changeTab', { detail: { tab: 'planner' } });
            window.dispatchEvent(event);
          }}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all duration-200"
        >
          <Calendar className="h-6 w-6 mb-2" />
          <div className="font-medium">Plan Workout</div>
          <div className="text-sm opacity-90">Create workout routine</div>
        </button>
      </div>
    </div>
  );

  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'stats': return <StatsGrid />;
      case 'progress': return <WeeklyChart />;
      case 'recent': return <RecentWorkouts />;
      case 'actions': return <QuickActions />;
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
              <label key={widget.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dashboardLayout.includes(widget.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      saveDashboardLayout([...dashboardLayout, widget.id]);
                    } else {
                      saveDashboardLayout(dashboardLayout.filter(id => id !== widget.id));
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
        {dashboardLayout.map(widgetId => (
          <div key={widgetId}>
            {renderWidget(widgetId)}
          </div>
        ))}
      </div>

      {/* Weekly Progress Chart */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Weekly Progress
          </h3>
          <div className="flex items-end justify-between h-32 bg-gray-50 rounded p-4">
            {stats.weeklyProgress.map((count, index) => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const maxCount = Math.max(...stats.weeklyProgress, 1);
              const height = (count / maxCount) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{days[index]}</span>
                  <span className="text-xs font-semibold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-green-600" />
          Recent Workouts
        </h3>
        
        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{workout.name}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(workout.date).toLocaleDateString()} • {formatDuration(workout.duration)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {workout.sets.length} exercises • {workout.sets.filter(s => s.completed).length} sets completed
                    </p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Target className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No workouts yet</p>
            <p className="text-sm text-gray-500">Start your first workout to see progress here</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => {
              // Start a new workout
              const workout = {
                id: Date.now().toString(),
                name: `Workout ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString(),
                duration: 0,
                sets: [],
                completed: false
              };
              saveWorkout(workout);
              
              // Navigate to workout tab
              const event = new CustomEvent('changeTab', { detail: { tab: 'workout' } });
              window.dispatchEvent(event);
            }}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all duration-200"
          >
            <Dumbbell className="h-6 w-6 mb-2" />
            <div className="font-medium">Start Workout</div>
            <div className="text-sm opacity-90">Begin tracking exercises</div>
          </button>
          <button 
            onClick={() => {
              // Navigate to planner tab
              const event = new CustomEvent('changeTab', { detail: { tab: 'planner' } });
              window.dispatchEvent(event);
            }}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all duration-200"
          >
            <Calendar className="h-6 w-6 mb-2" />
            <div className="font-medium">Plan Workout</div>
            <div className="text-sm opacity-90">Create workout routine</div>
          </button>
          <button 
            onClick={() => {
              console.log('🧪 [DEBUG] Manual Pokemon test triggered');
              // Trigger a test Pokemon reward
              const testWorkout = {
                id: 'test-' + Date.now(),
                name: 'Test Workout',
                date: new Date().toISOString(),
                duration: 30,
                exercises: [],
                sets: [],
                totalSets: 5,
                totalReps: 50,
                totalWeight: 100,
                completed: true
              };
              console.log('🧪 [DEBUG] Saving test workout:', testWorkout);
              saveWorkout(testWorkout);
            }}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all duration-200"
          >
            <div className="text-2xl mb-2">🏀</div>
            <div className="font-medium">Test Pokemon</div>
            <div className="text-sm opacity-90">Debug reward system</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;