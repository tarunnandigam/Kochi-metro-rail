import React, { useState, useEffect } from 'react';
import '../styles/VideoToggle.css';

export default function VideoToggle() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem('kmrl_video_enabled') === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('kmrl_video_enabled', enabled ? '1' : '0'); } catch {}
  }, [enabled]);

  return (
    <button
      className={`video-toggle ${enabled ? 'on' : 'off'}`}
      onClick={() => setEnabled(e => !e)}
      title={enabled ? 'Disable background video' : 'Enable background video'}
    >
      {enabled ? 'Background: ON' : 'Background: OFF'}
    </button>
  );
}
