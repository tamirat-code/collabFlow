import useToastStore from '../store/toastStore';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div key={toast.id} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast.message}
        </div>
      ))}
    </div>
  );
}