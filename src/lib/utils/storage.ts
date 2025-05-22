'use client';

/**
 * Storage utility for user preferences
 */

// Keys for storage
const STORAGE_KEYS = {
  PROJECT_VIEW: 'project-view-'
};

/**
 * Save the view preference for a specific project
 * @param projectId - The project ID
 * @param view - The view type ('list' or 'kanban')
 */
export function saveProjectViewPreference(projectId: string, view: 'list' | 'kanban'): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_KEYS.PROJECT_VIEW}${projectId}`, view);
  } catch (error) {
    console.error('Error saving project view preference:', error);
  }
}

/**
 * Get the view preference for a specific project
 * @param projectId - The project ID
 * @returns The saved view preference or null if not found
 */
export function getProjectViewPreference(projectId: string): 'list' | 'kanban' | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const value = localStorage.getItem(`${STORAGE_KEYS.PROJECT_VIEW}${projectId}`);
    if (value === 'list' || value === 'kanban') {
      return value;
    }
    return null;
  } catch (error) {
    console.error('Error getting project view preference:', error);
    return null;
  }
} 