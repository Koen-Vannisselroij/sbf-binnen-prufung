import React from 'react';

export default function ConfirmExitDialog({ onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true">
      <div className="confirm-modal">
        <p>Möchten Sie die Anwendung wirklich schließen?</p>
        <div className="confirm-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Nein
          </button>
          <button type="button" className="primary-button" onClick={onConfirm}>
            Ja, beenden
          </button>
        </div>
      </div>
    </div>
  );
}

