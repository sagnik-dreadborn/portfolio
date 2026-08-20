const container = document.getElementById('particle-container');
const shapes = ['circle', 'square', 'triangle'];
const shapeCount = 25;
const mouse = { x: -2000, y: -2000 };
const particleArray = [];

document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() {
        this.el = document.createElement('div');
        const type = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.random() * 20 + 10;
        this.el.className = `shape ${type}`;
        if(type !== 'triangle') {
            this.el.style.width = `${size}px`;
            this.el.style.height = `${size}px`;
        }
        container.appendChild(this.el);
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.repelRadius = 150;
    }

    update() {
        this.y += this.speedY;
        if (this.y > window.innerHeight + 50) {
            this.y = -50;
            this.x = Math.random() * window.innerWidth;
        }
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.repelRadius) {
            const force = (this.repelRadius - distance) / this.repelRadius;
            this.x -= (dx / distance) * force * 10;
            this.y -= (dy / distance) * force * 10;
        }
        this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}

function init() {
    particleArray.length = 0;
    container.innerHTML = '';
    for (let i = 0; i < shapeCount; i++) particleArray.push(new Particle());
}

function animate() {
    particleArray.forEach(p => p.update());
    requestAnimationFrame(animate);
}

init();
animate();
window.addEventListener('resize', init);

// Typewriter effect and Loader
document.addEventListener("DOMContentLoaded", () => {
    
    // --- DYNAMICALLY INJECT OVERLAYS ---
    // 1. Boot Loader Overlay
    let loaderWrapper = document.getElementById('loader-wrapper');
    let terminalText;
    
    const skipBoot = sessionStorage.getItem('skipBootLoader');
    sessionStorage.removeItem('skipBootLoader'); // Clear it so manual F5 works next time
    
    // Show boot loader on hard reload, unless it was a fallback SPA navigation
    if (!loaderWrapper && !skipBoot) {
        loaderWrapper = document.createElement('div');
        loaderWrapper.id = 'loader-wrapper';
        loaderWrapper.className = 'loader-wrapper';
        loaderWrapper.innerHTML = `
          <div class="terminal-loader">
            <span id="terminal-text"></span><span class="cursor"></span>
          </div>
        `;
        document.body.prepend(loaderWrapper);
    }
    terminalText = document.getElementById('terminal-text');

    // 2. SPA Transition Overlay
    let transitionWrapper = document.getElementById('page-transition-wrapper');
    let transitionTextEl;
    if (!transitionWrapper) {
        transitionWrapper = document.createElement('div');
        transitionWrapper.id = 'page-transition-wrapper';
        transitionWrapper.className = 'page-transition-wrapper';
        transitionWrapper.innerHTML = `
          <div class="page-transition-text">
            <span id="transition-text"></span><span class="cursor"></span>
          </div>
        `;
        document.body.prepend(transitionWrapper);
    }
    transitionTextEl = document.getElementById('transition-text');

    // --- INITIALIZE SITE ---
    if (loaderWrapper && terminalText) {
        document.body.classList.add('loading');
        const bootSequence = [
            "> initializing_environment...",
            "> loading_assets [100%]",
            "> connection_established;"
        ];
        
        let lineIndex = 0;
        let charIndex = 0;
        
        function typeLoader() {
            if (lineIndex < bootSequence.length) {
                const currentLine = bootSequence[lineIndex];
                if (charIndex < currentLine.length) {
                    terminalText.innerHTML += currentLine.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeLoader, 30 + Math.random() * 40);
                } else {
                    terminalText.innerHTML += "<br>";
                    lineIndex++;
                    charIndex = 0;
                    setTimeout(typeLoader, 400);
                }
            } else {
                setTimeout(() => {
                    loaderWrapper.classList.add('fade-out');
                    document.body.classList.remove('loading');
                    setTimeout(startHeroTypewriter, 500);
                }, 800);
            }
        }
        setTimeout(typeLoader, 300);
    } else {
        startHeroTypewriter();
    }

    // --- HERO TYPEWRITER ---
    function startHeroTypewriter() {
        const nameEl = document.querySelector('.highlight');
        if (nameEl && !nameEl.dataset.typed) {
            nameEl.dataset.typed = 'true';
            const text = nameEl.textContent.trim();
            nameEl.textContent = '';
            nameEl.style.borderRight = '3px solid var(--accent-color)';
            nameEl.style.animation = 'blink-caret 0.75s step-end infinite';
            nameEl.style.paddingRight = '5px';
            
            let i = 0;
            function typeWriter() {
                if (i < text.length) {
                    nameEl.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 120);
                }
            }
            setTimeout(typeWriter, 100);
        }
    }

    // --- SPA ROUTER ---
    function updateNavActive(href) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('href') === href || (href === '' && btn.getAttribute('href') === 'index.html')) {
                btn.classList.add('active');
            }
        });
    }

    async function loadPage(href, isPopState = false) {
        let pageName = href.replace('.html', '').replace('/', '') || 'home';
        if (pageName === 'index' || pageName === 'home') {
            pageName = 'about';
        }
        
        // Show transition
        if (transitionWrapper && transitionTextEl) {
            transitionWrapper.classList.add('active');
            transitionTextEl.innerHTML = '';
            
            const command = `> cd ${pageName}/`;
            let cIndex = 0;
            
            await new Promise(resolve => {
                function typeCmd() {
                    if (cIndex < command.length) {
                        transitionTextEl.innerHTML += command.charAt(cIndex);
                        cIndex++;
                        setTimeout(typeCmd, 50);
                    } else {
                        setTimeout(resolve, 300);
                    }
                }
                setTimeout(typeCmd, 200);
            });
        }

        try {
            const response = await fetch(href || 'index.html');
            const htmlText = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const newMain = doc.querySelector('.page-content');
            
            if (newMain) {
                const currentMain = document.querySelector('.page-content');
                currentMain.classList.add('fade-out');
                
                setTimeout(() => {
                    currentMain.innerHTML = newMain.innerHTML;
                    
                    const newHighlight = currentMain.querySelector('.highlight');
                    if (newHighlight) delete newHighlight.dataset.typed;
                    
                    currentMain.classList.remove('fade-out');
                    startHeroTypewriter();
                    
                    if (!isPopState) {
                        history.pushState(null, '', href);
                    }
                    updateNavActive(href || 'index.html');
                    
                    if (transitionWrapper) transitionWrapper.classList.remove('active');
                }, 300);
            } else {
                sessionStorage.setItem('skipBootLoader', 'true');
                window.location.href = href;
            }
        } catch (e) {
            sessionStorage.setItem('skipBootLoader', 'true');
            window.location.href = href;
        }
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-btn');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            if (href !== currentPath) {
                loadPage(href);
            }
        }
    });

    window.addEventListener('popstate', () => {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        loadPage(currentPath, true);
    });
});