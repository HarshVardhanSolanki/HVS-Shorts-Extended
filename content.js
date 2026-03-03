let indicatorTimer;

// Function to create and show the circular indicator (bilkul same)
function showIndicator(direction) {
    let indicator = document.getElementById('hvs-skip-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'hvs-skip-indicator';
        document.body.appendChild(indicator);
        
        const style = document.createElement('style');
        style.textContent = `
            #hvs-skip-indicator {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80px;
                height: 80px;
                background-color: rgba(0, 0, 0, 0.65);
                color: white;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: "YouTube Noto", Roboto, Arial, sans-serif;
                font-size: 15px;
                font-weight: 500;
                opacity: 0;
                pointer-events: none;
                z-index: 999999;
                transition: opacity 0.15s ease-in-out;
            }
            .hvs-icon {
                font-size: 24px;
                margin-bottom: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    if (direction === 'forward') {
        indicator.innerHTML = '<div class="hvs-icon">↻</div><div>+3%</div>';
    } else if (direction === 'backward') {
        indicator.innerHTML = '<div class="hvs-icon">↺</div><div>-3%</div>';
    }

    indicator.style.opacity = '1';
    clearTimeout(indicatorTimer);
    indicatorTimer = setTimeout(() => {
        indicator.style.opacity = '0';
    }, 500);
}

// Keydown listener with improved video selection
document.addEventListener('keydown', function(event) {
    if (!window.location.pathname.includes('/shorts/')) return;

    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
        return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.stopPropagation();
        event.preventDefault();
        
        // IMPROVED: Sirf Shorts wala bada video select karo
        const videos = Array.from(document.querySelectorAll('video'));
        let activeVideo = null;
        let maxArea = -1;

        videos.forEach(v => {
            if (v.readyState < 1) return;
            
            // Miniplayer ignore karo
            if (v.closest('ytd-miniplayer') || v.closest('.miniplayer') || v.closest('.ytp-miniplayer')) return;
            
            const rect = v.getBoundingClientRect();
            
            // Shorts video hamesha bada aur center mein hota hai
            if (rect.top >= -150 && 
                rect.bottom <= window.innerHeight + 150 && 
                rect.height > 350 && rect.width > 250) {   // yeh threshold perfect hai
                
                const area = rect.width * rect.height;
                if (area > maxArea) {
                    maxArea = area;
                    activeVideo = v;
                }
            }
        });

        // Fallback agar kuch nahi mila
        if (!activeVideo && videos.length > 0) {
            activeVideo = videos.find(v => !v.paused) || videos[0];
        }

        if (activeVideo && !isNaN(activeVideo.duration)) {
            const skipAmount = activeVideo.duration * 0.03;
            
            if (event.key === 'ArrowRight') {
                activeVideo.currentTime = Math.min(activeVideo.currentTime + skipAmount, activeVideo.duration);
                showIndicator('forward');
            } else if (event.key === 'ArrowLeft') {
                activeVideo.currentTime = Math.max(activeVideo.currentTime - skipAmount, 0);
                showIndicator('backward');
            }
        }
    }
}, true);
