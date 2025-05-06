import React, { useEffect, useRef } from 'react';
import { AR } from 'js-aruco';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const detector = new AR.Detector();

    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
      video.play();
    };

    const detectMarkers = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const markers = detector.detect(imageData);

        markers.forEach((marker) => {
          const corners = marker.corners;

          // Draw a solid blue square over the marker
          context.fillStyle = 'blue';
          context.beginPath();
          context.moveTo(corners[0].x, corners[0].y);
          for (let i = 1; i < corners.length; i++) {
            context.lineTo(corners[i].x, corners[i].y);
          }
          context.closePath();
          context.fill();

          // Log marker ID and corners
          console.log(`Marker ID: ${marker.id}`, marker.corners);

          // Draw marker ID on the canvas
          context.font = '16px Arial';
          context.fillStyle = 'red';
          context.fillText(`ID: ${marker.id}`, corners[0].x, corners[0].y - 10);
        });

        // Debugging: Log the number of markers detected
        console.log(`Number of markers detected: ${markers.length}`);

        if (markers.length === 0) {
          console.warn('No markers detected. Ensure the marker is visible and matches the expected dictionary.');
        }
      }
      requestAnimationFrame(detectMarkers);
    };

    startVideo().then(() => {
      requestAnimationFrame(detectMarkers);
    });

    return () => {
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <h1>AR Marker Detector</h1>
      <video ref={videoRef} style={{ width: '100%' }} />
      <canvas ref={canvasRef} style={{ width: '100%' }} />
    </div>
  );
};

export default App;
