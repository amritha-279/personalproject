/* ============================================================
   BOYFRIEND'S DAY DIGITAL SCRAPBOOK - SCRIPT.JS
   Optimized for 60fps liquid smooth transitions & background music.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initPageTransitions();
    initMusicPlayer();
    initSparkles();
    initFloatingDecorations();
});

/* ============================================================
   SMOOTH PAGE TRANSITION SYSTEM
   ============================================================ */
function initPageTransitions() {
    let overlay = document.querySelector('.page-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'page-overlay';
        document.body.appendChild(overlay);
    }

    // Trigger Entrance Class on Body
    document.body.classList.add('page-entering');
    setTimeout(() => {
        document.body.classList.remove('page-entering');
    }, 800);

    // Intercept Next Page Links for Soft Transition using Event Delegation
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        e.preventDefault();

        // Trigger Exit Transition
        document.body.classList.add('page-exiting');

        try {
            // Fetch the next page and wait for the CSS animation concurrently
            const [response] = await Promise.all([
                fetch(href),
                new Promise(resolve => setTimeout(resolve, 700))
            ]);
            
            const htmlText = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');
            
            // Update title
            document.title = newDoc.title;
            
            // Update progress badge
            const oldBadge = document.querySelector('.progress-badge');
            const newBadge = newDoc.querySelector('.progress-badge');
            if (oldBadge && newBadge) {
                oldBadge.innerHTML = newBadge.innerHTML;
            }
            
            // Update page container
            const oldContainer = document.querySelector('.page-container');
            const newContainer = newDoc.querySelector('.page-container');
            if (oldContainer && newContainer) {
                oldContainer.innerHTML = newContainer.innerHTML;
            }
            
            // Handle music hint (only on slide1)
            const oldHint = document.querySelector('#music-hint');
            const newHint = newDoc.querySelector('#music-hint');
            if (oldHint && !newHint) {
                oldHint.remove();
            } else if (!oldHint && newHint) {
                document.body.appendChild(newHint.cloneNode(true));
            }
            
            // Update URL
            history.pushState({}, '', href);
            
            // Scroll to top
            window.scrollTo(0, 0);

            // Trigger Entrance Transition
            document.body.classList.remove('page-exiting');
            document.body.classList.add('page-entering');
            setTimeout(() => {
                document.body.classList.remove('page-entering');
            }, 800);
            
        } catch (err) {
            console.error('Failed to load page smoothly, falling back to hard navigation:', err);
            // Save music state before hard reload
            saveMusicState();
            window.location.href = href;
        }
    });

    // Handle back/forward buttons
    window.addEventListener('popstate', () => {
        window.location.reload();
    });
}

/* ============================================================
   BACKGROUND MUSIC PLAYER WITH EFFICIENT STATE SAVING
   ============================================================ */
function initMusicPlayer() {
    const musicBtn = document.getElementById('music-btn');
    const bgMusic = document.getElementById('bg-music');

    if (!musicBtn || !bgMusic) return;

    // Restore playing state (but NOT time — always play from start)
    const isPlaying = localStorage.getItem('bgMusicPlaying') === 'true';

    if (isPlaying) {
        bgMusic.currentTime = 0;
        bgMusic.play().then(() => {
            musicBtn.classList.add('playing');
        }).catch((err) => {
            console.log('Autoplay policy waiting for user interaction:', err);
            musicBtn.classList.remove('playing');
        });
    }

    // Toggle Play/Pause — always restart from beginning on each click
    musicBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (bgMusic.paused) {
            bgMusic.currentTime = 0;
            bgMusic.play().then(() => {
                localStorage.setItem('bgMusicPlaying', 'true');
                musicBtn.classList.add('playing');
            }).catch(err => console.log('Audio error:', err));
        } else {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            localStorage.setItem('bgMusicPlaying', 'false');
            musicBtn.classList.remove('playing');
        }
    });

    // Save playing state on unload
    window.addEventListener('beforeunload', saveMusicState);
    window.addEventListener('pagehide', saveMusicState);
}

function saveMusicState() {
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic && !bgMusic.paused) {
        localStorage.setItem('bgMusicPlaying', 'true');
    }
}

/* ============================================================
   CLICK SPARKLES
   ============================================================ */
function initSparkles() {
    const sparkleContainer = document.getElementById('sparkle-container');
    if (!sparkleContainer) return;

    document.addEventListener('click', (e) => {
        if (e.target.closest('button, a, input')) return;
        createSparkleBurst(e.clientX, e.clientY);
    });
}

const sparkleColors = ['#f5a0b8', '#ffe566', '#98e4b0', '#d4a8f0', '#ff85a5', '#ffb3cc'];

function createSparkleBurst(x, y) {
    const sparkleContainer = document.getElementById('sparkle-container');
    if (!sparkleContainer) return;

    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-dot';

        const offsetX = (Math.random() - 0.5) * 36;
        const offsetY = (Math.random() - 0.5) * 36;
        const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        const size = Math.random() * 4 + 4;

        particle.style.left = `${x + offsetX}px`;
        particle.style.top = `${y + offsetY}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;

        sparkleContainer.appendChild(particle);

        setTimeout(() => { particle.remove(); }, 1100);
    }
}

/* ============================================================
   BACKGROUND COLORFUL STARS & HEARTS
   ============================================================ */
function initFloatingDecorations() {
    const container = document.getElementById('floating-decorations');
    if (!container) return;

    // Colorful 5-point stars
    const starColors = [
        'star-pink', 'star-yellow', 'star-mint', 'star-lavender', 'star-hotpink',
        'star-yellow', 'star-pink', 'star-mint', 'star-pink', 'star-yellow',
        'star-lavender', 'star-hotpink', 'star-mint', 'star-pink', 'star-yellow'
    ];

    starColors.forEach((colorClass, i) => {
        const star = document.createElement('div');
        star.className = `floating-element star-5pt ${colorClass}`;

        const size = Math.random() * 18 + 12;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 94 + 3}%`;
        star.style.top = `${Math.random() * 94 + 3}%`;
        star.style.animationDuration = `${Math.random() * 5 + 7}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.opacity = (Math.random() * 0.4 + 0.45).toString();

        container.appendChild(star);
    });

    // Floating SVG hearts
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.className = 'float-heart';
        const size = Math.random() * 10 + 10;
        heart.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${Math.random() > 0.5 ? '#e0457a' : '#c2305a'}" opacity="0.55"/></svg>`;
        heart.style.left = `${Math.random() * 90 + 5}%`;
        heart.style.top = `${Math.random() * 90 + 5}%`;
        heart.style.animationDuration = `${Math.random() * 6 + 10}s`;
        heart.style.animationDelay = `${Math.random() * 6}s`;
        container.appendChild(heart);
    }
}
