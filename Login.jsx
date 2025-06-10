import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const endpoint = isRegisterMode ? '/register' : '/login';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (isRegisterMode) {
        setSuccess('Registration successful. You can now log in.');
        setIsRegisterMode(false);
        return;
      }

      // Store JWT + basic user info on login
      const { token, userId, username: loggedInUsername } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', loggedInUsername);

      navigate('/logs');
    } catch (err) {
      console.error('Auth error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-transparent bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text drop-shadow-md">
          VB Abundance CRM App
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          <span className="float-right mr-4 italic">- developed by Sinister Six</span>
        </p>

        <div className="relative p-1 mt-6 mb-6 bg-gray-100 rounded-lg">
          <div className="flex">
            <button
              type="button"
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-all duration-300 ${role === 'employee' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole('employee')}
            >
              Employee
            </button>
            <button
              type="button"
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-all duration-300 ${role === 'admin' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
          </div>
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm rounded-md transition-all duration-300 mx-0.5 ${role === 'employee' ? 'translate-x-0' : 'translate-x-[calc(100%-2px)]'}`}
          ></div>
        </div>

        {error && <div className="mb-2 text-sm text-red-500">{error}</div>}
        {success && <div className="mb-2 text-sm text-green-600">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 hover:scale-105 active:scale-95"
          >
            {isRegisterMode ? 'Register' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccess('');
              setIsRegisterMode(!isRegisterMode);
            }}
            className="ml-1 text-blue-600 hover:underline"
          >
            {isRegisterMode ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
