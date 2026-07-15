/* ==========================================================================
   MD Labs JavaScript Actions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Theme Management (Dark / Light) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const logoImg = document.getElementById('logo-img');
    const footerLogo = document.getElementById('footer-logo');

    // Retrieve theme preference from storage or fallback to system settings
    const currentTheme = localStorage.getItem('theme') || 
                         (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    
    setTheme(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = htmlElement.getAttribute('data-theme');
        const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Swap logo assets based on theme
        // assets/logo-dark.png is white text on dark bg (for dark mode)
        // assets/logo-light.png is dark text on light bg (for light mode)
        if (theme === 'light') {
            if (logoImg) logoImg.src = 'assets/logo-light.png';
            if (footerLogo) footerLogo.src = 'assets/logo-light.png';
        } else {
            if (logoImg) logoImg.src = 'assets/logo-dark.png';
            if (footerLogo) footerLogo.src = 'assets/logo-dark.png';
        }
    }


    // --- 2. Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            
            // Toggle hamburger icon to close icon if needed
            const isOpen = navMenu.classList.contains('active');
            mobileToggle.innerHTML = isOpen 
                ? `<svg class="menu-close-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>`
                : `<svg class="menu-open-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                   </svg>`;
        });

        // Close menu when clicking links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                resetMobileMenuIcon();
            });
        });

        // Close menu when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                resetMobileMenuIcon();
            }
        });
    }

    function resetMobileMenuIcon() {
        if (mobileToggle) {
            mobileToggle.innerHTML = `<svg class="menu-open-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
               </svg>`;
        }
    }


    // --- 3. Scroll Reveal (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once visible to retain layout state
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('visible'));
    }


    // --- 4. Interactive Particles Background (Canvas) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let mouse = { x: null, y: null, radius: 100 };

        // Handle resize
        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            initParticles();
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Mouse move tracking
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Bounce off boundaries
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                // Move particle
                this.x += this.directionX;
                this.y += this.directionY;

                // Mouse interaction effect
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius + this.size) {
                        // Push away slightly
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= dx / distance * force * 3;
                        this.y -= dy / distance * force * 3;
                    }
                }

                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            let numberOfParticles = (canvas.width * canvas.height) / 14000;
            numberOfParticles = Math.min(numberOfParticles, 75); // Cap for performance

            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                
                // Set color style
                const theme = htmlElement.getAttribute('data-theme');
                let color = theme === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.15)';
                if (Math.random() > 0.5) {
                    color = theme === 'dark' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(3, 105, 161, 0.15)';
                }

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function connectParticles() {
            let opacityValue = 1;
            const theme = htmlElement.getAttribute('data-theme');
            const maxDistance = 120;

            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dx = particlesArray[a].x - particlesArray[b].x;
                    let dy = particlesArray[a].y - particlesArray[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        opacityValue = 1 - (distance / maxDistance);
                        const lineAlpha = theme === 'dark' ? opacityValue * 0.12 : opacityValue * 0.08;
                        ctx.strokeStyle = theme === 'dark' ? `rgba(99, 102, 241, ${lineAlpha})` : `rgba(79, 70, 229, ${lineAlpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connectParticles();
            requestAnimationFrame(animate);
        }

        animate();

        // Refresh particles colors when theme changes
        themeToggleBtn.addEventListener('click', () => {
            setTimeout(initParticles, 10);
        });
    }


    // --- 5. Interactive Synergy Tabs ---
    const tabItems = document.querySelectorAll('.tab-item');
    const clientNode = document.getElementById('node-client');
    const serverNode = document.getElementById('node-server');
    const beamFlow = document.getElementById('beam-flow');
    const detailsText = document.getElementById('visual-details-text');

    if (tabItems.length > 0 && clientNode && serverNode && beamFlow && detailsText) {
        tabItems.forEach(tab => {
            tab.addEventListener('click', () => {
                // Set active tab
                tabItems.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const selectedTab = tab.getAttribute('data-tab');

                // Reset visual animations
                clientNode.classList.remove('active');
                serverNode.classList.remove('active');
                beamFlow.style.animation = 'none';
                
                // Trigger reflow to restart animations
                void beamFlow.offsetWidth;

                // Animate based on selection
                if (selectedTab === 'tab-ui') {
                    clientNode.classList.add('active');
                    beamFlow.style.animation = 'flowDown 1.2s infinite linear reverse'; // Data prefetch upward flow
                    detailsText.innerHTML = `Dynamic routing active. Predictive cache: <span class="accent-text">98% hit rate</span>. UI latency: <span class="accent-text">~4ms</span>.`;
                } else if (selectedTab === 'tab-local') {
                    clientNode.classList.add('active');
                    beamFlow.style.animation = 'none'; // No server beam for local
                    detailsText.innerHTML = `On-device engine: <span class="accent-text">ONNX Runtime</span>. Local ML pipeline active. Latency: <span class="accent-text">0ms (Offline)</span>.`;
                } else if (selectedTab === 'tab-agent') {
                    clientNode.classList.add('active');
                    serverNode.classList.add('active');
                    beamFlow.style.animation = 'flowDown 2.5s infinite linear'; // Bidirectional flow
                    detailsText.innerHTML = `Autonomous workflow active. Agent query dispatch: <span class="accent-text">Enabled</span>. Integration synced.`;
                }
            });
        });
    }


    // --- 6. Form Submission Handling (Mocked Lead Pipeline) ---
    const leadForm = document.getElementById('lead-form');
    const formMessage = document.getElementById('form-message');

    if (leadForm && formMessage) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = leadForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;

            // Simple loading state animation
            submitBtn.disabled = true;
            submitBtn.innerHTML = `Sending request... <span class="badge-dot" style="margin-left: 8px;"></span>`;
            formMessage.className = 'form-message';
            formMessage.innerText = '';

            // Simulate server network latency (1.5 seconds)
            setTimeout(() => {
                const nameInput = document.getElementById('user-name');
                const name = nameInput ? nameInput.value.split(' ')[0] : 'there';
                
                // Display positive result message
                formMessage.className = 'form-message success';
                formMessage.innerHTML = `Thank you, ${name}! Your inquiry has been logged in our pipeline. We will reach out to you within 2 business hours.`;
                
                // Clear input controls
                leadForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                
                // Scroll down slightly to make sure message is read
                formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1500);
        });
    }

});
