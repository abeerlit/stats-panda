// ParticleBackground.jsx
import React, { useEffect, useRef } from 'react';

function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = document.documentElement.scrollWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: ['#FF0000', '#808080', '#FFA500'][Math.floor(Math.random() * 3)],
    });

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.15; // Set opacity to 15%
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });
      ctx.globalAlpha = 1; // Reset opacity to 100%
      requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create initial particles
    for (let i = 0; i < 300; i++) {
      particles.push(createParticle());
    }

    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}

export default ParticleBackground;
