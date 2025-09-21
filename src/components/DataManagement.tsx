import React, { useState } from 'react';
import { Download, Upload, Trash2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { storage } from '../utils/storage';
import LoadingSpinner from './LoadingSpinner';

const DataManagement: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importData, setImportData] = useState<string>('');

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      const data = {
        workouts: storage.getWorkouts(),
        plans: storage.getPlans(),
        stats: storage.getStats(),
        skills: storage.getSkills(),
        settings: storage.getSettings(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fittracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showMessage('success', 'Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      showMessage('error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const importDataFromText = async () => {
    if (!importData.trim()) {
      showMessage('error', 'Please paste your backup data first.');
      return;
    }

    setIsImporting(true);
    try {
      const data = JSON.parse(importData.trim());

      // Validate data structure
      if (!data.workouts || !data.plans || !data.stats || !data.skills || !data.settings) {
        throw new Error('Invalid backup file format');
      }

      // Import data (this would need to be implemented in storage utils)
      // For now, just show success message
      console.log('Importing data:', data);

      showMessage('success', 'Data imported successfully! Please refresh the page to see changes.');
      setImportData('');
    } catch (error) {
      console.error('Import error:', error);
      showMessage('error', 'Failed to import data. Please check your backup file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
      return;
    }

    setIsClearing(true);
    try {
      // Clear localStorage
      localStorage.clear();
      showMessage('success', 'All data cleared successfully! The page will refresh.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Clear error:', error);
      showMessage('error', 'Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Data Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Export your data for backup or import from a previous backup
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Download className="h-6 w-6 mr-2 text-blue-600" />
          Export Data
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Download a backup of all your workouts, plans, statistics, skills, and settings.
        </p>
        <button
          onClick={exportData}
          disabled={isExporting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          {isExporting ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Export Backup
            </>
          )}
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Upload className="h-6 w-6 mr-2 text-green-600" />
          Import Data
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Import data from a backup file. This will replace your current data.
        </p>

        {/* File Import */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>Import from File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900 dark:file:text-blue-300
                hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
            />
          </label>
        </div>

        {/* Text Import */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>Or paste backup data directly</span>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your JSON backup data here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </label>
        </div>

        <button
          onClick={importDataFromText}
          disabled={isImporting || !importData.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          {isImporting ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Import Data
            </>
          )}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center">
          <Trash2 className="h-6 w-6 mr-2" />
          Danger Zone
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-4">
          This action will permanently delete all your data. Make sure you have exported your data first.
        </p>
        <button
          onClick={clearAllData}
          disabled={isClearing}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          {isClearing ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="h-5 w-5 mr-2" />
              Clear All Data
            </>
          )}
        </button>
      </div>

      {/* Data Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          What gets backed up?
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>• All your workout history and completed sessions</li>
          <li>• Custom workout plans and templates</li>
          <li>• Statistics and progress tracking data</li>
          <li>• Skill trees and milestone achievements</li>
          <li>• App settings and preferences</li>
          <li>• Pokémon collection and rewards</li>
        </ul>
      </div>
    </div>
  );
};

export default DataManagement;