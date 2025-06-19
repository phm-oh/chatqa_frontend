import React from 'react';
import './Loading.module.css';

const Loading = ({ 
  message = 'กำลังโหลด...', 
  size = 'medium',
  variant = 'spinner',
  overlay = false,
  fullScreen = false 
}) => {
  
  // Spinner component
  const Spinner = ({ size }) => (
    <div className={`spinner spinner-${size}`}>
      <div className="spinner-circle"></div>
    </div>
  );

  // Dots component
  const Dots = ({ size }) => (
    <div className={`dots dots-${size}`}>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  // Pulse component
  const Pulse = ({ size }) => (
    <div className={`pulse pulse-${size}`}>
      <div className="pulse-circle"></div>
    </div>
  );

  // Wave component
  const Wave = ({ size }) => (
    <div className={`wave wave-${size}`}>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
    </div>
  );

  // Render loading animation based on variant
  const renderAnimation = () => {
    switch (variant) {
      case 'dots':
        return <Dots size={size} />;
      case 'pulse':
        return <Pulse size={size} />;
      case 'wave':
        return <Wave size={size} />;
      case 'spinner':
      default:
        return <Spinner size={size} />;
    }
  };

  // Loading content
  const loadingContent = (
    <div className={`loading-content loading-${size}`}>
      <div className="loading-animation">
        {renderAnimation()}
      </div>
      {message && (
        <div className="loading-message">
          {message}
        </div>
      )}
    </div>
  );

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="loading-fullscreen" role="status" aria-live="polite">
        <div className="loading-container">
          {loadingContent}
        </div>
      </div>
    );
  }

  // Overlay loading
  if (overlay) {
    return (
      <div className="loading-overlay" role="status" aria-live="polite">
        <div className="loading-container">
          {loadingContent}
        </div>
      </div>
    );
  }

  // Inline loading
  return (
    <div className="loading-inline" role="status" aria-live="polite">
      {loadingContent}
    </div>
  );
};

// Loading skeleton component for content placeholders
export const LoadingSkeleton = ({ 
  lines = 3, 
  width = '100%', 
  height = '1rem',
  className = '' 
}) => {
  return (
    <div className={`skeleton-container ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div 
          key={index}
          className="skeleton-line"
          style={{
            width: Array.isArray(width) ? width[index] || width[0] : width,
            height: Array.isArray(height) ? height[index] || height[0] : height
          }}
        />
      ))}
    </div>
  );
};

// Loading button component
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  loadingText = 'กำลังโหลด...',
  variant = 'primary',
  size = 'medium',
  ...props 
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="btn-spinner">
            <div className="spinner-small"></div>
          </div>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Loading card component
export const LoadingCard = ({ 
  height = '200px',
  showImage = true,
  showTitle = true,
  showText = true,
  lines = 3 
}) => {
  return (
    <div className="loading-card" style={{ minHeight: height }}>
      {showImage && (
        <div className="skeleton-image"></div>
      )}
      <div className="loading-card-content">
        {showTitle && (
          <div className="skeleton-title"></div>
        )}
        {showText && (
          <LoadingSkeleton 
            lines={lines}
            width={['100%', '80%', '60%']}
            height="0.875rem"
          />
        )}
      </div>
    </div>
  );
};

export default Loading;