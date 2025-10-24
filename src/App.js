import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, UserPlus, Shield, CheckCircle, AlertCircle, Smartphone, QrCode, Key, Loader } from 'lucide-react';
import './App.css'; // Importa los estilos

const App = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', mfaToken: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [mfaSecret, setMfaSecret] = useState(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  useEffect(() => {
    if (showLoadingScreen) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setShowLoadingScreen(false), 500);
            return 100;
          }
          return prev + 1.5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [showLoadingScreen]);

  const currentLoadingText = loadingMessages[Math.floor((loadingProgress / 100) * (loadingMessages.length - 1))];

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
      ? { email: formData.email, password: formData.password, mfaToken: formData.mfaToken || undefined }
      : { email: formData.email, password: formData.password, nombre: formData.nombre };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.status === 206) {
        setMfaRequired(true);
        setMessage({ type: 'info', text: data.instructions || 'Ingresa tu código de autenticación' });
      } else if (response.ok) {
        if (mode === 'login') {
          setMessage({ type: 'success', text: '¡Login exitoso!' });
          setShowLoadingScreen(true);
          setLoadingProgress(0);
          setTimeout(() => {
            setToken(data.token);
            setUserData(data.user);
            setMfaRequired(false);
            setFormData({ ...formData, mfaToken: '' });
          }, 3000);
        } else {
          setMessage({ type: 'success', text: '¡Registro exitoso! Ahora puedes iniciar sesión.' });
          setTimeout(() => {
            setMode('login');
            setFormData({ email: formData.email, password: '', nombre: '', mfaToken: '' });
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
    setFormData({ email: '', password: '', nombre: '', mfaToken: '' });
    setMessage({ type: '', text: '' });
    setMfaRequired(false);
    setShowMfaSetup(false);
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

  const setupMFA = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mfa/setup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setQrCode(data.qrCode);
        setMfaSecret(data.secret);
        setShowMfaSetup(true);
        setMessage({ type: 'success', text: 'QR generado. Escanéalo con Google Authenticator' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al generar QR' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!formData.mfaToken || formData.mfaToken.length !== 6) {
      setMessage({ type: 'error', text: 'Ingresa el código de 6 dígitos' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mfa/verify`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: formData.mfaToken })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: '¡MFA activado exitosamente!' });
        setUserData({ ...userData, mfa_enabled: true });
        setShowMfaSetup(false);
        setFormData({ ...formData, mfaToken: '' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Código incorrecto' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    const password = prompt('Ingresa tu contraseña para desactivar MFA:');
    if (!password) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mfa/disable`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'MFA desactivado' });
        setUserData({ ...userData, mfa_enabled: false });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al desactivar MFA' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  if (showLoadingScreen) {
    return (
      <div className="loading-screen">
        <div className="loading-background"></div>
        <div className="loading-content">
          <div className="loading-logo">
            <Shield size={64} className="shield-icon" />
          </div>
          <h1 className="loading-title">Bienvenido al Sistema...</h1>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <div className="progress-info">
              <span className="progress-percentage">{Math.round(loadingProgress)}%</span>
              <span className="progress-text">{currentLoadingText}</span>
            </div>
          </div>
          <Loader className="spinner-icon" size={32} />
        </div>
      </div>
    );
  }

  if (userData && token) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-card">
          <div className="success-header">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h2 className="dashboard-title">¡Bienvenido!</h2>
            <p className="dashboard-subtitle">Sesión iniciada correctamente</p>
          </div>

          <div className="user-info-section">
            <h3 className="section-title">
              <Shield size={24} />
              Información del Usuario
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{userData.nombre}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{userData.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Rol:</span>
                <span className="info-badge">{userData.rol}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ID:</span>
                <span className="info-value-mono">{userData.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Smartphone size={18} />
                  MFA (2FA):
                </span>
                <span className={`mfa-badge ${userData.mfa_enabled ? 'active' : 'inactive'}`}>
                  {userData.mfa_enabled ? '✓ Activado' : '✗ Desactivado'}
                </span>
              </div>
            </div>
          </div>

          {!userData.mfa_enabled && !showMfaSetup && (
            <div className="alert alert-warning">
              <AlertCircle size={24} />
              <div className="alert-content">
                <p className="alert-title">Mejora la seguridad de tu cuenta</p>
                <p className="alert-text">Activa la autenticación de dos factores (MFA)</p>
                <button onClick={setupMFA} disabled={loading} className="btn btn-warning">
                  <QrCode size={18} />
                  Activar MFA
                </button>
              </div>
            </div>
          )}

          {showMfaSetup && qrCode && (
            <div className="mfa-setup-panel">
              <h4 className="mfa-title">
                <QrCode size={24} />
                Configurar Autenticación de Dos Factores
              </h4>
              <div className="mfa-content">
                <div className="qr-section">
                  <p className="qr-instruction">Escanea este código QR con Google Authenticator</p>
                  <img src={qrCode} alt="QR Code" className="qr-image" />
                  <div className="secret-box">
                    <p className="secret-label">O ingresa este código manualmente:</p>
                    <p className="secret-code">{mfaSecret}</p>
                  </div>
                </div>
                <div className="verify-section">
                  <label className="input-label">Código de verificación de 6 dígitos</label>
                  <input
                    type="text"
                    name="mfaToken"
                    value={formData.mfaToken}
                    onChange={handleChange}
                    placeholder="123456"
                    maxLength="6"
                    className="mfa-input"
                  />
                </div>
                <div className="button-group">
                  <button onClick={verifyMFA} disabled={loading || formData.mfaToken.length !== 6} className="btn btn-primary">
                    {loading ? <Loader className="spin" size={20} /> : 'Verificar y Activar'}
                  </button>
                  <button onClick={() => { setShowMfaSetup(false); setFormData({ ...formData, mfaToken: '' }); }} className="btn btn-secondary">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {userData.mfa_enabled && (
            <div className="alert alert-success">
              <CheckCircle size={24} />
              <span>MFA está activo y protegiendo tu cuenta</span>
              <button onClick={disableMFA} disabled={loading} className="btn-link">Desactivar</button>
            </div>
          )}

          <div className="alert alert-info">
            <Lock size={16} />
            <p><strong>Token JWT generado:</strong> El token está activo y expirará en 1 hora.</p>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="button-group">
            <button onClick={getProfile} disabled={loading} className="btn btn-primary btn-large">
              {loading ? <Loader className="spin" size={24} /> : 'Actualizar Perfil'}
            </button>
            <button onClick={handleLogout} className="btn btn-secondary btn-large">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="header-logo">
            <Shield size={40} />
          </div>
          <h1 className="header-title">Sistema Seguro UMG</h1>
          <p className="header-subtitle">Implementación Segura de Aplicaciones</p>
          <p className="header-features">✓ JWT • ✓ MFA • ✓ Alertas en Tiempo Real</p>
        </div>

        <div className="mode-tabs">
          <button onClick={() => { setMode('login'); setMessage({ type: '', text: '' }); setMfaRequired(false); }} className={`tab ${mode === 'login' ? 'active' : ''}`}>
            Iniciar Sesión
          </button>
          <button onClick={() => { setMode('register'); setMessage({ type: '', text: '' }); setMfaRequired(false); }} className={`tab ${mode === 'register' ? 'active' : ''}`}>
            Registrarse
          </button>
        </div>

        <div className="form-container">
          {message.text && (
            <div className={`message message-${message.type}`}>
              {message.type === 'success' ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <div className="input-wrapper">
                  <UserPlus className="input-icon" size={20} />
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Juan Pérez" className="form-input" required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="usuario@ejemplo.com" className="form-input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'} className="form-input" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {mode === 'register' && <p className="form-hint">Debe contener mayúsculas, minúsculas y números</p>}
            </div>

            {mode === 'login' && mfaRequired && (
              <div className="form-group">
                <label className="form-label">
                  <Smartphone size={18} />
                  Código de Autenticación (MFA)
                </label>
                <div className="input-wrapper">
                  <Key className="input-icon" size={20} />
                  <input type="text" name="mfaToken" value={formData.mfaToken} onChange={handleChange} placeholder="123456" maxLength="6" className="form-input mfa-input-field" required />
                </div>
                <p className="form-hint mfa-hint">Ingresa el código de 6 dígitos de Google Authenticator</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-submit">
              {loading ? <Loader className="spin" size={24} /> : mode === 'login' ? <><LogIn size={22} /> Iniciar Sesión</> : <><UserPlus size={22} /> Crear Cuenta</>}
            </button>
          </form>

          {mode === 'login' && !mfaRequired && (
            <div className="demo-credentials">
              <p className="demo-title"><Lock size={16} /> Credenciales de prueba:</p>
              <p className="demo-text">Email: admin@umg.edu.gt</p>
              <p className="demo-text">Password: Admin123456</p>
            </div>
          )}
        </div>

        <div className="login-footer">
          <p>Universidad Mariano Gálvez de Guatemala<br/>Maestría en Seguridad Informática</p>
        </div>
      </div>
    </div>
  );
};

export default App;