import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import Hls from 'hls.js';

const VideoPlayer = ({ src, title, onEnded, onTimeUpdate }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;
    setLoading(true);
    setError(null);

    const video = videoRef.current;

    const isHls = src.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setLoading(false));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Video failed to load. Please try again.');
          setLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      video.addEventListener('loadedmetadata', () => setLoading(false));
    } else {
      // Regular MP4
      video.src = src;
      video.addEventListener('loadeddata', () => setLoading(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = '';
    };
  }, [src]);

  return (
    <Box sx={{ position: 'relative', width: '100%', bgcolor: '#000', borderRadius: 2, overflow: 'hidden', aspectRatio: '16/9' }}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#111', zIndex: 2, gap: 2 }}>
          <CircularProgress sx={{ color: '#fff' }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Loading video…</Typography>
        </Box>
      )}
      {error && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <video
        ref={videoRef}
        controls
        style={{ width: '100%', height: '100%', display: 'block' }}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        preload="metadata"
        playsInline
      />
    </Box>
  );
};

export default VideoPlayer;
