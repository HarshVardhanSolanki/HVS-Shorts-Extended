let indicatorTimer;

// Function to create and show the circular indicator
function showIndicator(direction) {
    let indicator = document.getElementById('hvs-skip-indicator');
    
    // Create the indicator element and its styles if it doesn't exist yet
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

    // Set the text and icon based on the direction
    if (direction === 'forward') {
        indicator.innerHTML = '<div class="hvs-icon">↻</div><div>+3%</div>';
    } else if (direction === 'backward') {
        indicator.innerHTML = '<div class="hvs-icon">↺</div><div>-3%</div>';
    }

    // Show the indicator
    indicator.style.opacity = '1';
    
    // Clear any existing timer to prevent flickering if keys are mashed
    clearTimeout(indicatorTimer);
    
    // Hide the indicator after 500 milliseconds
    indicatorTimer = setTimeout(() => {
        indicator.style.opacity = '0';
    }, 500);
}

// Keydown event listener with capture phase (true) to override YouTube's defaults
document.addEventListener('keydown', function(event) {
    // Only execute if we are actually watching a Short
    if (!window.location.pathname.includes('/shorts/')) {
        return;
    }

    // Prevent the script from triggering if you are typing in the comments or search
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
        return;
    }

    // Check if the pressed key is the Left or Right Arrow
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        
        // Block YouTube from doing its default behavior
        event.stopPropagation();
        event.preventDefault();
        
        // Find all video elements on the page
        const videos = Array.from(document.querySelectorAll('video'));
        
        // Find the video that is actually in view and ready to play
        let activeVideo = videos.find(v => {
            const rect = v.getBoundingClientRect();
            return rect.top >= -100 && rect.bottom <= (window.innerHeight + 100) && v.readyState > 0;
        });

        // Fallback: If position check fails, grab the one that is currently playing
        if (!activeVideo && videos.length > 0) {
            activeVideo = videos.find(v => !v.paused) || videos[0];
        }

        if (activeVideo && !isNaN(activeVideo.duration)) {
            // Calculate exactly 3% of the video's total duration
            const skipAmount = activeVideo.duration * 0.03;
            
            if (event.key === 'ArrowRight') {
                // Skip forward by 3%
                activeVideo.currentTime = Math.min(activeVideo.currentTime + skipAmount, activeVideo.duration);
                showIndicator('forward');
            } else if (event.key === 'ArrowLeft') {
                // Skip backward by 3%
                activeVideo.currentTime = Math.max(activeVideo.currentTime - skipAmount, 0);
                showIndicator('backward');
            }
        }
    }
}, true);