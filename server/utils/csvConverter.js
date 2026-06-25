import { Parser } from 'json2csv';

export const tasksToCSV = (tasks) => {
  const fields = [
    { label: 'Title',       value: 'title' },
    { label: 'Description', value: 'description' },
    { label: 'Status',      value: 'status' },
    { label: 'Priority',    value: 'priority' },
    { label: 'Assignee',    value: row => row.assignee?.name || '' },
    { label: 'Due Date',    value: row => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '' },
    { label: 'Created At',  value: row => new Date(row.createdAt).toLocaleDateString() },
    { label: 'Created By',  value: row => row.createdBy?.name || '' },
  ];

  const parser = new Parser({ fields });
  return parser.parse(tasks);
};

export const tasksToJSON = (tasks) => {
  return tasks.map(t => ({
    title:       t.title,
    description: t.description || '',
    status:      t.status,
    priority:    t.priority,
    assignee:    t.assignee?.name || '',
    dueDate:     t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
    createdAt:   new Date(t.createdAt).toLocaleDateString(),
    createdBy:   t.createdBy?.name || '',
  }));
};