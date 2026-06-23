import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCompleteTour } from '../hooks/useAuth';

export default function OnboardingTour({ onDone }) {
  const { mutate: completeTour } = useCompleteTour();

  useEffect(() => {
    const driverObj = driver({
      animate:          true,
      showProgress:     true,
      showButtons:      ['next', 'previous', 'close'],
      nextBtnText:      'Next →',
      prevBtnText:      '← Back',
      doneBtnText:      'Done 🎉',
      progressText:     '{{current}} of {{total}}',
      popoverClass:     'collabflow-tour',
      onDestroyStarted: () => {
        completeTour();
        onDone?.();
        driverObj.destroy();
      },
      steps: [
        {
          element: '[data-tour="new-workspace"]',
          popover: {
            title:       '👋 Welcome to CollabFlow!',
            description: 'Start by creating a workspace for your team. Click the workspace dropdown to get started.',
            side:        'right',
            align:       'start',
          },
        },
        {
          element: '[data-tour="invite-member"]',
          popover: {
            title:       '👥 Invite Your Team',
            description: 'Add teammates to your workspace so you can collaborate on projects together.',
            side:        'right',
            align:       'start',
          },
        },
        {
          element: '[data-tour="new-project"]',
          popover: {
            title:       '📁 Create a Project',
            description: 'Projects hold your tasks. Click the + button to create your first project.',
            side:        'right',
            align:       'start',
          },
        },
        {
          element: '[data-tour="kanban-board"]',
          popover: {
            title:       '✅ Create Tasks',
            description: 'Click the + button in any column to add tasks to your project.',
            side:        'top',
            align:       'center',
          },
        },
        {
          element: '[data-tour="kanban-column-todo"]',
          popover: {
            title:       '🖱️ Drag & Drop',
            description: 'Drag tasks between columns to update their status — from To Do → In Progress → Done.',
            side:        'top',
            align:       'center',
          },
        },
        {
          element: '[data-tour="notification-bell"]',
          popover: {
            title:       '🔔 Notifications',
            description: 'Stay updated here — get notified when tasks are assigned, commented on, or due soon.',
            side:        'left',
            align:       'start',
          },
        },
      ],
    });

   
    const t = setTimeout(() => driverObj.drive(), 600);
    return () => {
      clearTimeout(t);
      driverObj.destroy();
    };
  }, []);

  return null;
}