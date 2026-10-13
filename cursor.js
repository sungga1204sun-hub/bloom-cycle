const cursor = document.createElement("img");
cursor.src = "/assets/cursor.png";
cursor.alt = "";
cursor.setAttribute("aria-hidden", "true");
cursor.className = "custom-cursor";

Object.assign(cursor.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "54px",
    height: "54px",
    zIndex: "9999999999",
    pointerEvents: "none",
    transform: "translate3d(-50%, -50%, 0)",
    willChange: "transform, opacity",
    opacity: "0",
    transition: "opacity .18s ease"
});

document.body.appendChild(cursor);
document.body.style.cursor = "none";

let targetX = innerWidth / 2;
let targetY = innerHeight / 2;
let currentX = targetX;
let currentY = targetY;
let visible = false;
let running = false;

function tick(){
    if(!visible){ running = false; return; }
    currentX += (targetX-currentX)*.24;
    currentY += (targetY-currentY)*.24;
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    if(Math.abs(targetX-currentX)>.1 || Math.abs(targetY-currentY)>.1){
        requestAnimationFrame(tick);
    }else{
        running = false;
    }
}

addEventListener("mousemove", e => {
    targetX=e.clientX; targetY=e.clientY;
    if(!visible){ currentX=targetX; currentY=targetY; cursor.style.opacity="1"; visible=true; }
    if(!running){ running=true; requestAnimationFrame(tick); }
}, {passive:true});

addEventListener("mouseleave",()=>{cursor.style.opacity="0";visible=false;running=false});
