import React from 'react';
import { Dumbbell, Clock, TrendingUp } from 'lucide-react';
import { WorkoutStats } from '../types/workout';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle, color }) => (
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

interface StatsGridProps {
  stats: WorkoutStats | null;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
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
};

export default StatsGrid;
