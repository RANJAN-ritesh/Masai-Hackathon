// CSS Loading Fix for Admin Dashboard
// This script ensures CSS is properly loaded even when no hackathons exist

const ensureCSSLoaded = () => {
  // Check if Tailwind CSS is loaded
  const checkTailwindLoaded = () => {
    const testElement = document.createElement('div');
    testElement.className = 'bg-indigo-600';
    testElement.style.display = 'none';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const backgroundColor = computedStyle.backgroundColor;
    
    document.body.removeChild(testElement);
    
    // If Tailwind is loaded, backgroundColor should be rgb(79, 70, 229) or similar
    return backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent';
  };

  // Check if CSS variables are set
  const checkCSSVariables = () => {
    const root = document.documentElement;
    const bgColor = root.style.getPropertyValue('--theme-bg');
    return bgColor && bgColor.trim() !== '';
  };

  // Apply fallback styles if CSS is not properly loaded
  const applyFallbackStyles = () => {
    const root = document.documentElement;
    
    // Set default CSS variables
    root.style.setProperty('--theme-bg', '#f8fafc');
    root.style.setProperty('--theme-text', '#1e293b');
    root.style.setProperty('--theme-accent', '#3b82f6');
    root.style.setProperty('--theme-card-bg', '#ffffff');
    root.style.setProperty('--theme-border', '#e2e8f0');
    root.style.setProperty('--theme-button-bg', '#3b82f6');
    root.style.setProperty('--theme-button-hover', '#2563eb');
    root.style.setProperty('--theme-navbar-bg', '#ffffff');
    root.style.setProperty('--theme-input-bg', '#ffffff');
    root.style.setProperty('--theme-input-border', '#cbd5e1');
    root.style.setProperty('--theme-success', '#10b981');
    root.style.setProperty('--theme-warning', '#f59e0b');
    root.style.setProperty('--theme-danger', '#ef4444');
    root.style.setProperty('--theme-muted-text', '#64748b');
    root.style.setProperty('--theme-shadow-color', 'rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--theme-hover-bg', '#f8fafc');
    
    // Apply to body
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#1e293b';
    document.body.style.fontFamily = 'Inter, sans-serif';
    document.body.style.transition = 'all 0.3s ease';
    
    console.log('🎨 Applied fallback CSS styles for admin dashboard');
  };

  // Check and fix CSS loading
  const checkAndFixCSS = () => {
    const tailwindLoaded = checkTailwindLoaded();
    const cssVariablesSet = checkCSSVariables();
    
    if (!tailwindLoaded || !cssVariablesSet) {
      console.log('⚠️ CSS not properly loaded, applying fallback styles');
      applyFallbackStyles();
      
      // Retry after a short delay
      setTimeout(() => {
        if (!checkTailwindLoaded() || !checkCSSVariables()) {
          console.log('🔄 Retrying CSS loading...');
          applyFallbackStyles();
        }
      }, 1000);
    } else {
      console.log('✅ CSS properly loaded');
    }
  };

  // Run checks
  checkAndFixCSS();
  
  // Also run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndFixCSS);
  }
  
  // Run periodically to ensure CSS stays loaded
  setInterval(checkAndFixCSS, 5000);
};

// Export for use in components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ensureCSSLoaded };
} else {
  window.ensureCSSLoaded = ensureCSSLoaded;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  ensureCSSLoaded();
}
