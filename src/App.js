import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, UserPlus, Shield, CheckCircle, AlertCircle, Smartphone, QrCode, Key, Loader, Download, Copy, RotateCcw } from 'lucide-react';
import './App.css';

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
  const [backupCodes, setBackupCodes] = useState(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [modalAction, setModalAction] = useState(''); // 'regenerate' o 'get'

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
    setBackupCodes(null);
    setShowBackupCodes(false);
    setShowPasswordModal(false);
    setModalPassword('');
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
      setMessage({ 
        type: 'success', 
        text: data.message || '¡MFA activado exitosamente!' 
      });
      setUserData({ ...userData, mfa_enabled: true });
      setShowMfaSetup(false);
      setFormData({ ...formData, mfaToken: '' });
      
      // Mostrar códigos de respaldo si están disponibles
      if (data.backup_codes || data.backupCodes) {
        const codes = data.backup_codes || data.backupCodes;
        setBackupCodes(codes);
        setShowBackupCodes(true);
        
        // Mostrar advertencia si viene en la respuesta
        if (data.warning) {
          setMessage({ 
            type: 'info', 
            text: `${data.message}. ${data.warning}` 
          });
        }
      }
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
        setBackupCodes(null);
        setShowBackupCodes(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al desactivar MFA' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = async () => {
    if (!modalPassword) {
      setModalAction('regenerate');
      setShowPasswordModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mfa/backup-codes/regenerate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: modalPassword })
      });
      const data = await response.json();
      
      if (response.ok) {
        setBackupCodes(data.backup_codes || data.backupCodes);
        setShowBackupCodes(true);
        setShowPasswordModal(false);
        setModalPassword('');
        setMessage({ 
          type: 'success', 
          text: data.message || 'Nuevos códigos de respaldo generados' 
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al generar códigos' });
        setModalPassword('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
      setModalPassword('');
    } finally {
      setLoading(false);
    }
  };

  const getBackupCodes = async () => {
    setModalAction('get');
    setShowPasswordModal(true);
  };

  const handleGetBackupCodes = async () => {
    if (!modalPassword) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mfa/backup-codes`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: modalPassword })
      });
      const data = await response.json();
      
      if (response.ok) {
        setBackupCodes(data.backup_codes || data.backupCodes);
        setShowBackupCodes(true);
        setShowPasswordModal(false);
        setModalPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al obtener códigos' });
        setModalPassword('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
      setModalPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordModalSubmit = () => {
    if (modalAction === 'regenerate') {
      generateBackupCodes();
    } else if (modalAction === 'get') {
      handleGetBackupCodes();
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      setMessage({ type: 'success', text: 'Códigos copiados al portapapeles' });
    });
  };

  const downloadBackupCodes = () => {
    const codesText = `Códigos de Respaldo - ${userData.email}\n\n` +
                     `Generado: ${new Date().toLocaleString()}\n\n` +
                     backupCodes.join('\n') +
                     `\n\n⚠️ IMPORTANTE: Guarda estos códigos en un lugar seguro. ` +
                     `Son tu única forma de recuperar el acceso si pierdes tu dispositivo.`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${userData.email}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        {/* Modal para contraseña */}
        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  <Lock size={24} />
                  Verificación de Seguridad
                </h3>
                <p className="modal-subtitle">
                  {modalAction === 'regenerate' 
                    ? 'Ingresa tu contraseña para regenerar los códigos de respaldo'
                    : 'Ingresa tu contraseña para ver los códigos de respaldo'
                  }
                </p>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={20} />
                    <input 
                      type="password" 
                      value={modalPassword}
                      onChange={(e) => setModalPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="form-input"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={handlePasswordModalSubmit}
                  disabled={!modalPassword || loading}
                  className="btn btn-primary"
                >
                  {loading ? <Loader className="spin" size={20} /> : 'Continuar'}
                </button>
                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setModalPassword('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

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
        <p className="form-hint mfa-verification-hint">
          ⚠️ <strong>Importante:</strong> Este es el código de <strong>6 dígitos</strong> de Google Authenticator. 
          Después de verificar, recibirás <strong>10 códigos de respaldo de 16 caracteres</strong> que debes guardar.
        </p>
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

          {showBackupCodes && backupCodes && (
  <div className="backup-codes-panel">
    <h4 className="backup-codes-title">
      <Key size={24} />
      Códigos de Respaldo Generados
    </h4>
    <div className="backup-codes-content">
      <div className="backup-codes-warning critical">
        <AlertCircle size={20} />
        <div>
          <strong>⚠️ GUARDA ESTOS CÓDIGOS DE RESPALDO</strong>
          <p>Estos son códigos de <strong>16 caracteres</strong> para recuperar tu cuenta si pierdes el acceso a Google Authenticator.</p>
          <p><strong>No los confundas</strong> con los códigos de 6 dígitos de Google Authenticator.</p>
          <p><em>Cada código solo se puede usar una vez.</em></p>
        </div>
      </div>
      
      <div className="backup-codes-explanation">
        <div className="explanation-item">
          <div className="explanation-icon">🔐</div>
          <div className="explanation-text">
            <strong>Código de 6 dígitos</strong>
            <span>Para iniciar sesión diariamente (Google Authenticator)</span>
          </div>
        </div>
        <div className="explanation-item">
          <div className="explanation-icon">📋</div>
          <div className="explanation-text">
            <strong>Código de 16 caracteres</strong>
            <span>Para emergencias si pierdes tu teléfono (estos códigos)</span>
          </div>
        </div>
      </div>

      <div className="backup-codes-grid">
        {backupCodes.map((code, index) => (
          <div key={index} className="backup-code-item">
            <span className="backup-code-number">{index + 1}.</span>
            <span className="backup-code-value">{code}</span>
          </div>
        ))}
      </div>
      
      <div className="backup-codes-actions">
        <button onClick={copyBackupCodes} className="btn btn-secondary">
          <Copy size={16} />
          Copiar Códigos
        </button>
        <button onClick={downloadBackupCodes} className="btn btn-primary">
          <Download size={16} />
          Descargar TXT
        </button>
        <button onClick={() => setShowBackupCodes(false)} className="btn btn-success">
          <CheckCircle size={16} />
          He guardado los códigos
        </button>
      </div>
    </div>
  </div>
)}

          {userData.mfa_enabled && !showBackupCodes && (
            <div className="alert alert-success">
              <CheckCircle size={24} />
              <div className="alert-content">
                <span>MFA está activo y protegiendo tu cuenta</span>
                <div className="mfa-actions">
                  <button onClick={getBackupCodes} disabled={loading} className="btn-link">
                    <Key size={16} />
                    Ver códigos de respaldo
                  </button>
                  <button onClick={() => {
                    setModalAction('regenerate');
                    setShowPasswordModal(true);
                  }} disabled={loading} className="btn-link">
                    <RotateCcw size={16} />
                    Regenerar códigos
                  </button>
                  <button onClick={disableMFA} disabled={loading} className="btn-link danger">
                    Desactivar MFA
                  </button>
                </div>
              </div>
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

  // ... (el resto del código de login/register se mantiene igual)
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