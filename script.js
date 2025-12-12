/**
 * DocPrep Landing Page - Smooth Scrolling and Interactions
 */

// ============================================
// Smooth Scroll Navigation
// ============================================

function initSmoothScroll() {
    const navOffset = 80; // Height of fixed navigation bar
    
    // Handle scroll indicator click
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const problemSection = document.getElementById('problem');
            if (problemSection) {
                const elementPosition = problemSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Handle any anchor links for smooth scrolling (including nav links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Scroll Animations with Intersection Observer
// ============================================

function initScrollAnimations() {
    const sections = document.querySelectorAll('.landing-section:not(.section-footer)');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Show first section immediately
    if (sections.length > 0) {
        sections[0].classList.add('visible');
    }
    
    // Make footer visible immediately (not animated)
    const footer = document.querySelector('.section-footer');
    if (footer) {
        footer.classList.add('visible');
    }
}

// ============================================
// Scroll-Based Tree Animation
// ============================================

function initScrollBasedTreeAnimation() {
    const section = document.getElementById('problem');
    const treeBefore = document.querySelector('.tree-before');
    const treeAfter = document.querySelector('.tree-after');
    const treeArrow = document.querySelector('.tree-arrow');
    const centerSizeCounter = document.querySelector('.center-size-counter');
    const treeCenter = document.querySelector('.tree-center');
    const afterRows = document.querySelectorAll('.tree-after .finder-row');
    const totalSizeValue = document.getElementById('totalSizeValue');
    
    if (!treeBefore || !treeAfter || !treeArrow || !section) return;
    
    // File sizes for animation calculation (in MB)
    // Before: Q1=245, Q2=312, Budget=89, NDA=2.4, Agreement=5.1, Terms=18, Sales=156 = 827.5 MB
    // After: CSVs ~3.2MB, TXTs ~0.1MB = ~3.3 MB total
    const startSize = 827.5;
    const endSize = 3.3;
    
    function formatSize(mb) {
        if (mb >= 1) {
            return mb.toFixed(1) + ' MB';
        } else {
            return (mb * 1000).toFixed(0) + ' KB';
        }
    }
    
    function updateTreeAnimation() {
        const windowHeight = window.innerHeight;
        const sectionRect = section.getBoundingClientRect();
        
        // Use the progress wheel/center element as the trigger point for START
        const centerRect = treeCenter ? treeCenter.getBoundingClientRect() : treeBefore.getBoundingClientRect();
        
        // Animation starts when center/wheel enters viewport
        // Animation completes when section bottom reaches viewport bottom (section fills screen)
        const animationStartPoint = windowHeight; // Start when center enters viewport
        
        // Calculate when section bottom will be at viewport bottom
        // At that point: sectionRect.bottom = windowHeight
        // So we need: centerRect.top when sectionRect.bottom = windowHeight
        // The distance from center to section bottom is constant
        const centerToBottom = sectionRect.bottom - centerRect.top;
        
        // Animation should complete when section.bottom = windowHeight
        // At start: centerRect.top = windowHeight (center just entered)
        // At end: sectionRect.bottom = windowHeight, so centerRect.top = windowHeight - centerToBottom
        const animationEndCenterTop = windowHeight - centerToBottom;
        const animationRange = animationStartPoint - animationEndCenterTop;
        
        // Check if we're below the element
        const isBelowViewport = centerRect.top > windowHeight;
        
        if (isBelowViewport) {
            // Reset all animations when element is below viewport
            treeArrow.style.opacity = '0';
            treeAfter.style.opacity = '0';
            treeAfter.style.transform = 'translateX(20px)';
            
            if (centerSizeCounter) centerSizeCounter.style.opacity = '0';
            if (totalSizeValue) totalSizeValue.textContent = formatSize(startSize);
            
            afterRows.forEach(row => {
                row.style.opacity = '0';
                row.style.transform = 'translateY(5px)';
            });
        } else {
            // Calculate progress based on center element position
            const scrolledPast = animationStartPoint - centerRect.top;
            const overallProgress = Math.max(0, Math.min(1, scrolledPast / animationRange));
            
            // Fade in center elements immediately when they enter viewport
            const centerOpacity = Math.min(1, overallProgress / 0.1);
            treeArrow.style.opacity = centerOpacity.toString();
            if (centerSizeCounter) centerSizeCounter.style.opacity = centerOpacity.toString();
            
            // Animate tree panel sliding in (starts at 5% progress, completes by 30%)
            if (overallProgress > 0.05) {
                const treeProgress = Math.min(1, (overallProgress - 0.05) / 0.25);
                treeAfter.style.opacity = treeProgress.toString();
                treeAfter.style.transform = `translateX(${20 * (1 - treeProgress)}px)`;
            } else {
                treeAfter.style.opacity = '0';
                treeAfter.style.transform = 'translateX(20px)';
            }
            
            // Animate individual rows sequentially based on overall progress
            const rowCount = afterRows.length;
            const rowStartPoint = 0.15;  // First row appears at 15%
            const rowEndPoint = 0.90;    // Last row appears at 90%
            const rowRange = rowEndPoint - rowStartPoint;
            
            afterRows.forEach((row, index) => {
                // Each row appears at a specific progress point
                const rowStartProgress = rowStartPoint + (index / rowCount) * rowRange;
                
                if (overallProgress >= rowStartProgress) {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0px)';
                } else {
                    row.style.opacity = '0';
                    row.style.transform = 'translateY(5px)';
                }
            });
            
            // Animate total size counter - synced with row animation
            // Size should reach minimum when last row appears (at rowEndPoint)
            if (totalSizeValue) {
                // Map overallProgress to size progress (0 at rowStartPoint, 1 at rowEndPoint)
                const sizeProgress = Math.max(0, Math.min(1, (overallProgress - rowStartPoint) / rowRange));
                const currentSize = startSize - (sizeProgress * (startSize - endSize));
                totalSizeValue.textContent = formatSize(currentSize);
            }
        }
    }
    
    // Use requestAnimationFrame for smooth updates
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateTreeAnimation();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    updateTreeAnimation(); // Initial call
}

// ============================================
// Download Button Handlers
// ============================================

function initDownloadButtons() {
    const downloadMac = document.getElementById('download-mac');
    const downloadWindows = document.getElementById('download-windows');
    
    if (downloadMac) {
        downloadMac.addEventListener('click', (e) => {
            e.preventDefault();
            // Placeholder - will be replaced with actual download link
            console.log('Mac download clicked - placeholder');
            // TODO: Replace with actual download URL when available
            // window.location.href = 'path/to/docprep.dmg';
        });
    }
    
    if (downloadWindows) {
        downloadWindows.addEventListener('click', (e) => {
            e.preventDefault();
            // Placeholder - will be replaced with actual download link
            console.log('Windows download clicked - placeholder');
            // TODO: Replace with actual download URL when available
            // window.location.href = 'path/to/docprep.exe';
        });
    }
}

// ============================================
// Active Navigation Link on Scroll
// ============================================

function initActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.landing-section');
    const navOffset = 100; // Offset for active state detection
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + navOffset;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
        
        // Handle top of page
        if (scrollPosition < sections[0].offsetTop) {
            navLinks.forEach(link => link.classList.remove('active'));
            const homeLink = document.querySelector('.nav-link[href="#hero"]');
            if (homeLink) {
                homeLink.classList.add('active');
            }
        }
    }
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Initial call
}

// ============================================
// Polka Dot Background Generator
// ============================================

function createPolkaDots() {
    const container = document.createElement('div');
    container.className = 'polka-dots';
    
    const config = {
        count: 20,
        minSize: 60,
        maxSize: 400,
        minOpacity: 0.03,
        maxOpacity: 0.07,
        // Ring distribution - dots avoid center
        centerX: 50,
        centerY: 50,
        minRadius: 25,  // % from center - inner ring boundary
        maxRadius: 55,  // % from center - outer ring boundary
        padding: 10     // px padding between dots
    };
    
    const placedDots = []; // Track placed dots for collision detection
    
    // Check if a new dot overlaps with any existing dot
    function checkOverlap(x, y, size) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const newX = (x / 100) * viewportWidth;
        const newY = (y / 100) * viewportHeight;
        const newRadius = size / 2;
        
        for (const dot of placedDots) {
            const existingX = (dot.x / 100) * viewportWidth;
            const existingY = (dot.y / 100) * viewportHeight;
            const existingRadius = dot.size / 2;
            
            const distance = Math.sqrt(
                Math.pow(newX - existingX, 2) + Math.pow(newY - existingY, 2)
            );
            
            const minDistance = newRadius + existingRadius + config.padding;
            
            if (distance < minDistance) {
                return true; // Overlap detected
            }
        }
        return false;
    }
    
    let attempts = 0;
    const maxAttempts = 500; // Prevent infinite loop
    
    while (placedDots.length < config.count && attempts < maxAttempts) {
        attempts++;
        
        // Generate position in ring pattern
        const angle = Math.random() * Math.PI * 2;
        const radius = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
        const x = config.centerX + Math.cos(angle) * radius;
        const y = config.centerY + Math.sin(angle) * radius;
        
        const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
        
        // Check for overlap
        if (checkOverlap(x, y, size)) {
            continue; // Try again
        }
        
        const opacity = config.minOpacity + Math.random() * (config.maxOpacity - config.minOpacity);
        
        const dot = document.createElement('div');
        dot.className = 'polka-dot';
        
        dot.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, ${opacity});
            transform: translate(-50%, -50%);
        `;
        
        container.appendChild(dot);
        placedDots.push({ x, y, size });
    }
    
    document.body.insertBefore(container, document.body.firstChild);
}

// ============================================
// Initialize on DOM Load
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    createPolkaDots();
    initSmoothScroll();
    initScrollAnimations();
    initDownloadButtons();
    initActiveNavLink();
    initScrollBasedTreeAnimation();
});
