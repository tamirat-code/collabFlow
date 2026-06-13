import { useNavigate } from 'react-router-dom';
import { useMe, useLogout } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout(undefined, { onSuccess: () => navigate('/login') });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">CollabFlow</h1>
        <div className="flex items-center gap-4">
          {user?.avatar && (
            <img src={user.avatar} className="w-8 h-8 rounded-full" />
          )}
          <span className="text-sm text-gray-700">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500">Your workspace is ready. Week 2 features coming soon.</p>
      </main>
    </div>
  );
}