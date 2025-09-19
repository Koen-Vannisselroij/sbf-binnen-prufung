import React, { forwardRef } from 'react';
import headerBadge from '../assets/icons/header_badge_sailboat.svg';

const HeaderBar = forwardRef(function HeaderBar({ onToggleMenu }, ref) {
  return (
    <header className="header" ref={ref}>
      <div className="header-inner">
        <div className="brand">
          <span className="logo">
            <img src={headerBadge} alt="SBF Binnen Trainer" />
          </span>
          <h1>SBF Binnen Trainer</h1>
        </div>
        <button
          className="menu-button"
          type="button"
          aria-label="Menü öffnen"
          onClick={onToggleMenu}
        >
          ☰
        </button>
      </div>
      <p className="subtitle">Sportbootführerschein Binnen – Üben & Verstehen</p>
    </header>
  );
});

export default HeaderBar;

