import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useCreateProject } from '../../hooks/useProjects';
import { projectSchema } from '../../lib/validationSchemas';
import useWorkspaceStore from '../../store/workspaceStore';

export default function CreateProjectModal({ workspaceId, onClose }) {
  const { mutate, isPending, error } = useCreateProject(workspaceId);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (project) => {
        setActiveProject(project._id);
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error.message}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
            <input
              {...register('name')}
              autoFocus
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="e.g. Website Redesign"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What's this project about?"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
}