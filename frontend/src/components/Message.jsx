function Message({ type = 'info', children, onClose }) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={`alert alert-${type}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className="alert-icon" aria-hidden="true">
        {type === 'success' ? '✓' : '!'}
      </span>
      <span className="alert-text">{children}</span>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Dismiss message"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default Message;
