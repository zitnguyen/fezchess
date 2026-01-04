import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login({ username, password });
      
      // Redirect based on role
      if (user.role === 'Admin') {
        navigate('/dashboard');
      } else if (user.role === 'Teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'Parent' || user.role === 'Student') {
        navigate('/student/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Login failed", err);
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', background: '#F3F4F6'
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Đăng Nhập</h1>
            <p style={{ color: '#6B7280' }}>Hệ thống quản lý trung tâm cờ vua</p>
        </div>

        {error && (
            <div style={{
                background: '#FEF2F2', color: '#991B1B', 
                padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px'
            }}>
                {error}
            </div>
        )}

        <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Tên đăng nhập / Email
                </label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                        width: '100%', padding: '10px', borderRadius: '6px', 
                        border: '1px solid #D1D5DB', outlineColor: '#2563EB'
                    }}
                />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Mật khẩu
                </label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                        width: '100%', padding: '10px', borderRadius: '6px', 
                        border: '1px solid #D1D5DB', outlineColor: '#2563EB'
                    }}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                style={{
                    width: '100%', padding: '12px', background: '#2563EB', color: 'white',
                    border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                    opacity: loading ? 0.7 : 1
                }}
            >
                <LogIn size={18} />
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
