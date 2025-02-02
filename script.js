// script.js
const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const distanceDisplay = document.getElementById("distance");
const ctx = canvas.getContext("2d");

let points = [];
let isInitialized = false;

// Initialize canvas size and position
function initializeCanvas() {
    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear any existing drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isInitialized = true;
}

// Access camera with error handling
async function startCamera() {
    try {
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        // Wait for video to be ready
        video.addEventListener("loadedmetadata", () => {
            initializeCanvas();
        });
        
        // Handle video playing
        video.addEventListener("play", () => {
            if (!isInitialized) {
                initializeCanvas();
            }
        });
        
    } catch (error) {
        console.error("Error accessing camera:", error);
        document.getElementById("info").innerHTML = 
            `<p style="color: red">Camera Error: ${error.message}</p>
             <p>Please ensure you have:
                <br>1. Allowed camera permissions
                <br>2. A working camera connected
                <br>3. No other apps using the camera</p>`;
    }
}

// Handle canvas clicks with position correction
canvas.addEventListener("click", (e) => {
    if (!isInitialized) return;
    
    const rect = canvas.getBoundingClientRect();
    // Calculate scale factors in case canvas is resized
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Get position relative to canvas and apply scaling
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (points.length < 2) {
        points.push({ x, y });
        drawPoint(x, y);
        
        if (points.length === 2) {
            const distance = calculateDistance(points[0], points[1]);
            distanceDisplay.textContent = distance.toFixed(2);
            drawLine(points[0], points[1]);
            
            // Reset after a short delay
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                points = [];
            }, 2000);
        }
    }
});

function drawPoint(x, y) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add a white outline for better visibility
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawLine(p1, p2) {
    // Draw with both stroke and glow for better visibility
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    
    // Add measurement text
    const distance = calculateDistance(p1, p2);
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`${distance.toFixed(1)}px`, midX, midY - 10);
}

function calculateDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Start everything when the page loads
document.addEventListener("DOMContentLoaded", startCamera);