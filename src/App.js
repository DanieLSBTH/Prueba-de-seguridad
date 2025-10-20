import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, UserPlus, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const App = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLoadingText, setCurrentLoadingText] = useState('');

  const API_URL = 'https://seguridad-9ub0.onrender.com';

  const loadingMessages = [
    'Inicializando Sistema de Seguridad UMG...',
    'Conectando con Base de Datos Segura...',
    'Cargando Módulos de Autenticación...',
    'Preparando Interfaz de Usuario...',
    'Configurando Protocolos de Seguridad...',
    'Verificando Conexiones Encriptadas...',
    'Cargando Credenciales de Usuario...',
    'Preparando Panel de Control...',
    '¡Sistema Listo para Usar!'
  ];

  // Efectos de animación
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showLoadingScreen) {
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
              setShowLoadingScreen(false);
            }, 1000);
            return 100;
          }
          return prev + 1.2;
        });
      }, 80);
      return () => clearInterval(loadingInterval);
    }
  }, [showLoadingScreen]);

  useEffect(() => {
    if (showLoadingScreen) {
      const messageIndex = Math.floor((loadingProgress / 100) * (loadingMessages.length - 1));
      setCurrentLoadingText(loadingMessages[messageIndex] || loadingMessages[0]);
    }
  }, [loadingProgress, showLoadingScreen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === 'login') {
          setMessage({ type: 'success', text: '¡Login exitoso!' });
          setShowLoadingScreen(true);
          setLoadingProgress(0);
          setTimeout(() => {
            setToken(data.token);
            setUserData(data.user);
          }, 3000);
        } else {
          setMessage({ type: 'success', text: '¡Registro exitoso! Ahora puedes iniciar sesión.' });
          setTimeout(() => {
            setMode('login');
            setFormData({ email: formData.email, password: '', nombre: '' });
          }, 2000);
        }
      } else {
        const errorMsg = data.error || (data.errors && data.errors[0]?.msg) || 'Error en la operación';
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUserData(null);
    setFormData({ email: '', password: '', nombre: '' });
    setMessage({ type: '', text: '' });
  };

  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado' });
        setUserData(data.user);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al obtener perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga
  if (showLoadingScreen) {
    return (
      <div className="loading-screen">
        <div className="loading-background">
          <div className="gradient-overlay"></div>
          <div className="floating-particles">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="loading-content">
          <div className="hospital-logo-container">
            <div className="hospital-logo">
              <Shield size={60} color="#1e40af" />
            </div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring-2"></div>
          </div>

          <div className="title-section">
            <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '3rem' }}>
              Bienvenido al Sistema
              <span className="loading-dots">.</span>
            </h1>
          </div>

          <div className="progress-section">
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="progress-shine"></div>
                </div>
              </div>
              <div className="progress-info">
                <span className="progress-percentage">{Math.round(loadingProgress)}%</span>
                <span className="progress-text">{currentLoadingText}</span>
              </div>
            </div>
          </div>

          <div className="main-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring-2"></div>
          </div>
        </div>

        <style>{`
          .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .loading-background {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 25%, #be185d 50%, #dc2626 75%, #1e3a8a 100%);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
          }
          .gradient-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
          }
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255,255,255,0.6);
            border-radius: 50%;
            animation: float 5s ease-in-out infinite, twinkle 2s ease-in-out infinite;
          }
          .loading-content {
            position: relative;
            text-align: center;
            z-index: 10;
            max-width: 600px;
            padding: 2rem;
          }
          .hospital-logo-container {
            position: relative;
            margin-bottom: 3rem;
            display: inline-block;
          }
          .hospital-logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 3;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          }
          .pulse-ring, .pulse-ring-2 {
            position: absolute;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            animation: pulse-ring 2s ease-out infinite;
          }
          .pulse-ring {
            width: 140px;
            height: 140px;
            top: -10px;
            left: -10px;
          }
          .pulse-ring-2 {
            width: 160px;
            height: 160px;
            top: -20px;
            left: -20px;
            animation-delay: 1s;
          }
          .loading-dots:after {
            content: '.';
            animation: dots 1.5s steps(5, end) infinite;
          }
          .progress-section {
            margin: 3rem 0;
          }
          .progress-container {
            max-width: 400px;
            margin: 0 auto;
          }
          .progress-bar {
            width: 100%;
            height: 12px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 1rem;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
            background-size: 200% 100%;
            border-radius: 20px;
            position: relative;
            animation: shimmer 2s linear infinite;
            transition: width 0.3s ease;
          }
          .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
          }
          .progress-percentage {
            font-size: 1.2rem;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .progress-text {
            font-size: 0.9rem;
            opacity: 0.9;
            text-align: right;
            animation: pulse 2s ease-in-out infinite;
          }
          .main-spinner {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto;
          }
          .spinner-ring, .spinner-ring-2 {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-radius: 50%;
          }
          .spinner-ring {
            border-top-color: #60a5fa;
            border-right-color: #a78bfa;
            animation: spin 1.5s linear infinite;
          }
          .spinner-ring-2 {
            border-bottom-color: #f472b6;
            border-left-color: #fbbf24;
            animation: spin 1.5s linear infinite reverse;
          }
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          @keyframes dots {
            0%, 20% { color: rgba(255,255,255,0); text-shadow: 0.25em 0 0 rgba(255,255,255,0), 0.5em 0 0 rgba(255,255,255,0); }
            40% { color: white; text-shadow: 0.25em 0 0 rgba(255,255,255,0), 0.5em 0 0 rgba(255,255,255,0); }
            60% { text-shadow: 0.25em 0 0 white, 0.5em 0 0 rgba(255,255,255,0); }
            80%, 100% { text-shadow: 0.25em 0 0 white, 0.5em 0 0 white; }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  // Dashboard después del login
  if (userData && token) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-background">
          <div className="gradient-overlay"></div>
        </div>

        <div className="dashboard-content">
          <div className="success-icon-container">
            <CheckCircle size={60} color="#10b981" />
          </div>
          
          <h2 className="dashboard-title">¡Bienvenido al Sistema!</h2>
          <p className="dashboard-subtitle">Sesión iniciada correctamente</p>

          <div className="user-info-card">
            <h3 className="info-title">
              <Shield size={20} />
              Información del Usuario
            </h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{userData.nombre}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{userData.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Rol:</span>
                <span className="info-badge">{userData.rol}</span>
              </div>
              <div className="info-row">
                <span className="info-label">ID:</span>
                <span className="info-value-mono">{userData.id}</span>
              </div>
            </div>
          </div>

          <div className="token-alert">
            <p>🔐 <strong>Token JWT generado:</strong> El token está activo y expirará en 1 hora.</p>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="action-buttons">
            <button onClick={getProfile} disabled={loading} className="btn-primary">
              {loading ? 'Cargando...' : 'Actualizar Perfil'}
            </button>
            <button onClick={handleLogout} className="btn-secondary">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <style>{`
          .dashboard-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            position: relative;
          }
          .dashboard-background {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #be185d 100%);
            z-index: -1;
          }
          .dashboard-content {
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 3rem;
            text-align: center;
          }
          .success-icon-container {
            width: 80px;
            height: 80px;
            background: #d1fae5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
          }
          .dashboard-title {
            font-size: 2rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          .dashboard-subtitle {
            color: #6b7280;
            margin-bottom: 2rem;
          }
          .user-info-card {
            background: #f9fafb;
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            text-align: left;
          }
          .info-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.1rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1.5rem;
          }
          .info-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .info-label {
            color: #6b7280;
            font-weight: 600;
          }
          .info-value {
            color: #1f2937;
            font-weight: 700;
          }
          .info-value-mono {
            color: #1f2937;
            font-family: monospace;
          }
          .info-badge {
            background: #dbeafe;
            color: #1e40af;
            padding: 0.4rem 1rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 700;
          }
          .token-alert {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            color: #92400e;
          }
          .message {
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
          }
          .message.success {
            background: #d1fae5;
            color: #065f46;
          }
          .message.error {
            background: #fee2e2;
            color: #991b1b;
          }
          .action-buttons {
            display: flex;
            gap: 1rem;
          }
          .btn-primary, .btn-secondary {
            flex: 1;
            padding: 0.875rem;
            border-radius: 12px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
          }
          .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);
          }
          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .btn-secondary {
            background: #6b7280;
            color: white;
          }
          .btn-secondary:hover {
            background: #4b5563;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  // Pantalla de login/registro
  return (
    <div className="login-container">
      <div className="solid-background">
        <div 
          className="background-image"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80)'
          }}
        />
        <div className="background-overlay" />
      </div>

      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="login-content">
        <div className={`hospital-branding ${showForm ? 'slide-in' : ''}`}>
          <div className="hospital-logo">
            <div className="logo-icon">
              <Shield size={48} />
            </div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring-2"></div>
          </div>
          <h1 className="hospital-title">Sistema Seguro UMG</h1>
          <p className="hospital-subtitle">Universidad Mariano Gálvez</p>
          <p className="hospital-subtitle">Implementación Segura de Aplicaciones</p>
        </div>

        <div className={`login-form-container ${showForm ? 'slide-in-delay' : ''}`}>
          <div className="login-form">
            <div className="form-header">
              <h2>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
              <p>Accede al sistema de gestión seguro</p>
            </div>

            <div className="mode-tabs">
              <button
                onClick={() => { setMode('login'); setMessage({ type: '', text: '' }); }}
                className={`tab ${mode === 'login' ? 'active' : ''}`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setMode('register'); setMessage({ type: '', text: '' }); }}
                className={`tab ${mode === 'register' ? 'active' : ''}`}
              >
                Registrarse
              </button>
            </div>

            {message.text && (
              <div className={`error-message ${message.type}`}>
                <div className="error-icon">
                  {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                </div>
                <span>{message.text}</span>
              </div>
            )}

            <form className="form" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="input-group">
                  <div className="input-wrapper">
                    <UserPlus className="input-icon" size={20} />
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre Completo"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="form-input"
                    />
                    <div className="input-underline"></div>
                  </div>
                </div>
              )}

              <div className="input-group">
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <div className="input-underline"></div>
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <div className="input-underline"></div>
                </div>
                {mode === 'register' && (
                  <p className="input-hint">Mínimo 8 caracteres con mayúsculas, minúsculas y números</p>
                )}
              </div>

              <button 
                type="submit"
                className={`login-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <span>{mode === 'login' ? 'INGRESAR' : 'CREAR CUENTA'}</span>
                )}
                <div className="button-shine"></div>
              </button>
            </form>

            {mode === 'login' && (
              <div className="demo-info">
                <p className="demo-title">🔐 Credenciales de prueba:</p>
                <p className="demo-text">Email: admin@umg.edu.gt</p>
                <p className="demo-text">Password: Admin123456</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .login-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .solid-background {
          position: absolute;
          inset: 0;
          background: #1e3a8a;
          z-index: 1;
        }
        .background-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, 
            rgba(30, 58, 138, 0.9) 0%, 
            rgba(124, 58, 237, 0.8) 25%, 
            rgba(190, 24, 93, 0.8) 50%, 
            rgba(220, 38, 38, 0.9) 75%, 
            rgba(30, 58, 138, 0.9) 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          z-index: 2;
        }
        .floating-particles {
          position: absolute;
          inset: 0;
          z-index: 2;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite, twinkle 3s ease-in-out infinite;
        }
        .login-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1200px;
          padding: 2rem;
          display: flex;
          gap: 4rem;
          align-items: center;
          justify-content: center;
        }
        .hospital-branding {
          flex: 1;
          text-align: center;
          opacity: 0;
          transform: translateX(-50px);
          animation: slideInLeft 0.8s ease forwards;
        }
        .hospital-branding.slide-in {
          opacity: 1;
          transform: translateX(0);
        }
        .hospital-logo {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 0 auto 2rem;
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .logo-icon {
          color: #1e40af;
          animation: pulse 2s ease-in-out infinite;
        }
        .pulse-ring, .pulse-ring-2 {
          position: absolute;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          animation: pulse-ring 2s ease-out infinite;
        }
        .pulse-ring {
          width: 170px;
          height: 170px;
          top: -10px;
          left: -10px;
        }
        .pulse-ring-2 {
          width: 190px;
          height: 190px;
          top: -20px;
          left: -20px;
          animation-delay: 1s;
        }
        .hospital-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
          text-shadow: 0 4px 12px rgba(0,0,0,0.3);
          letter-spacing: -0.5px;
        }
        .hospital-subtitle {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.9);
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .login-form-container {
          flex: 1;
          max-width: 450px;
          opacity: 0;
          transform: translateX(50px);
          animation: slideInRight 0.8s ease forwards 0.2s;
        }
        .login-form-container.slide-in-delay {
          opacity: 1;
          transform: translateX(0);
        }
        .login-form {
          background: rgba(255,255,255,0.98);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          backdrop-filter: blur(20px);
        }
        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .form-header h2 {
          font-size: 1.875rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        .form-header p {
          color: #6b7280;
          font-size: 0.95rem;
        }
        .mode-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: 12px;
        }
        .tab {
          flex: 1;
          padding: 0.75rem;
          border: none;
          background: transparent;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tab.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .error-message {
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
        }
        .error-message.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }
        .error-message.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .input-group {
          position: relative;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          color: #9ca3af;
          z-index: 2;
        }
        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: white;
          color: #1f2937;
        }
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          z-index: 2;
        }
        .password-toggle:hover {
          color: #6b7280;
        }
        .input-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .form-input:focus ~ .input-underline {
          transform: scaleX(1);
        }
        .input-hint {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .login-button {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }
        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.4);
        }
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-button.loading {
          pointer-events: none;
        }
        .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shine 3s ease-in-out infinite;
        }
        .demo-info {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
        }
        .demo-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 0.5rem;
        }
        .demo-text {
          font-size: 0.8rem;
          font-family: monospace;
          color: #3b82f6;
          margin: 0.25rem 0;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }
        @media (max-width: 968px) {
          .login-content {
            flex-direction: column;
            gap: 2rem;
          }
          .hospital-branding {
            order: 1;
          }
          .login-form-container {
            order: 2;
            max-width: 100%;
          }
          .hospital-logo {
            width: 120px;
            height: 120px;
          }
          .hospital-title {
            font-size: 2rem;
          }
          .hospital-subtitle {
            font-size: 1rem;
          }
        }
        @media (max-width: 480px) {
          .login-container {
            padding: 1rem;
          }
          .login-form {
            padding: 1.5rem;
          }
          .hospital-title {
            font-size: 1.75rem;
          }
          .form-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default App;