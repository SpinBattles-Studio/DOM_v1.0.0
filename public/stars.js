// Natural starry background with smooth mouse interaction
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'stars-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  
  const ctx = canvas.getContext('2d');
  let stars = [];
  let mouseX = -1000;
  let mouseY = -1000;
  const mouseRadius = 100;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  }
  
  function initStars() {
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 6000);
    
    for (let i = 0; i < numStars; i++) {
      const vx = (Math.random() - 0.5) * 0.2;
      const vy = (Math.random() - 0.5) * 0.2;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: vx,
        vy: vy,
        originalVx: vx,
        originalVy: vy,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        baseOpacity: Math.random() * 0.5 + 0.3
      });
    }
  }
  
  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
      // Calculate distance from mouse
      const dx = mouseX - star.x;
      const dy = mouseY - star.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Mouse repulsion effect
      if (distance < mouseRadius && distance > 0) {
        // Stronger repulsion when closer
        const force = (mouseRadius - distance) / mouseRadius;
        const angle = Math.atan2(dy, dx);
        const repelX = -Math.cos(angle) * force * 2;
        const repelY = -Math.sin(angle) * force * 2;
        
        star.vx += repelX * 0.15;
        star.vy += repelY * 0.15;
      } else {
        // Smoothly return to original path
        star.vx += (star.originalVx - star.vx) * 0.05;
        star.vy += (star.originalVy - star.vy) * 0.05;
      }
      
      // Apply damping
      star.vx *= 0.95;
      star.vy *= 0.95;
      
      // Natural floating movement
      star.x += star.vx;
      star.y += star.vy;
      
      // Wrap around edges
      if (star.x < 0) star.x = canvas.width;
      if (star.x > canvas.width) star.x = 0;
      if (star.y < 0) star.y = canvas.height;
      if (star.y > canvas.height) star.y = 0;
      
      // Twinkle effect
      star.opacity += star.twinkleSpeed;
      if (star.opacity > star.baseOpacity + 0.3 || star.opacity < star.baseOpacity - 0.1) {
        star.twinkleSpeed *= -1;
      }
      
      // Draw star
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
    });
    
    requestAnimationFrame(drawStars);
  }
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  document.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });
  
  window.addEventListener('resize', resize);
  resize();
  drawStars();
})();
