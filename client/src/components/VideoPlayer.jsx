import React from 'react';
import './VideoPlayer.css';

export default function VideoPlayer({ src, token }) {
  return (
    <div className="video-player">
      <video
        controls
        width="100%"
        preload="metadata"
        className="video-player__video"
      >
        <source src={`${src}?token=${token}`} type="video/mp4" />
        Your browser does not support video playback.
      </video>
    </div>
  );
}
