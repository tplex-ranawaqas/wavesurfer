export const loadFFmpegCDN = () => {
  return new Promise((resolve, reject) => {
    // If already loaded
    if (window.createFFmpeg) return resolve(window.createFFmpeg);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/ffmpeg.min.js';
    script.onload = () => resolve(window.createFFmpeg);
    script.onerror = () => reject(new Error('Failed to load FFmpeg from CDN'));
    document.body.appendChild(script);
  });
};
