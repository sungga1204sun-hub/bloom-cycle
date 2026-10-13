import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { Raycaster, Vector2 } from "three";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
45,
window.innerWidth / window.innerHeight,
0.1,
100
);

camera.position.set(0,0,10);

const renderer = new THREE.WebGLRenderer({

alpha:true,

antialias:true

});

renderer.setSize(

window.innerWidth,

window.innerHeight

);

renderer.setPixelRatio(

Math.min(

window.devicePixelRatio,

2

)

);

document.body.appendChild(

renderer.domElement

);

const world = new THREE.Group();

scene.add(world);

const loader = new GLTFLoader();

const textureLoader =
new THREE.TextureLoader();

const raycaster =
new Raycaster();

const mouse =
new Vector2();

const hero =
document.querySelector(".hero");

const heroEgg =
document.querySelector(".hero-egg");

const heroVideo =
document.querySelector(".hero-video");

let flower1Info
let flower2Info
let flower3Info

window.addEventListener("DOMContentLoaded",()=>{

    flower1Info =
    document.getElementById("flower1-info")

    flower2Info =
    document.getElementById("flower2-info")

    flower3Info =
    document.getElementById("flower3-info")

})

const bgTexture = null;

const glowTexture =
textureLoader.load(
"/assets/glow.png"
);

const bg = new THREE.Mesh(

new THREE.PlaneGeometry(

60,

34

),

new THREE.MeshBasicMaterial({

color:0x000000,

transparent:true

})

);

bg.position.set(

0,

0,

-35

);

scene.add(bg);

const glow = new THREE.Mesh(

new THREE.PlaneGeometry(

14,

14

),

new THREE.MeshBasicMaterial({

map:glowTexture,

transparent:true,

opacity:.22,

depthWrite:false,

blending:
THREE.AdditiveBlending

})

);

glow.position.set(

0,

0,

-2

);

scene.add(glow);

const sun =
new THREE.DirectionalLight(

0xffffff,

3

);

sun.position.set(

-6,

8,

6

);

scene.add(sun);

scene.add(

new THREE.HemisphereLight(

0xddeeff,

0x334422,

1.5

)

);

scene.add(

new THREE.AmbientLight(

0xffffff,

0.55

)

);

const point =
new THREE.PointLight(

0xffffff,

2.2,

40

);

point.position.set(

0,

2,

8

);

scene.add(point);
let flower1
let flower2
let flower3

let hovered = null

let mouseX = 0
let mouseY = 0

let targetY = 0
let currentY = 0

let worldTarget = 0

let targetRotX = 0
let targetRotY = 0

let velocityX = 0
let velocityY = 0

let lastX = 0
let lastY = 0

let dragDistance = 0

let isDragging = false
let isMoving = false

let targetPage = ""

loader.load("/assets/flower1.glb",(gltf)=>{

    flower1 = gltf.scene

    flower1.scale.set(1.3,1.3,1.3)

    flower1.position.set(0,-6,0)

    world.add(flower1)

})

loader.load("/assets/flower2.glb",(gltf)=>{

    flower2 = gltf.scene

    flower2.scale.set(1.3,1.3,1.3)

    flower2.position.set(0,-12,0)

    world.add(flower2)

})

loader.load("/assets/flower3.glb",(gltf)=>{

    flower3 = gltf.scene

    flower3.scale.set(1.3,1.3,1.3)

    flower3.position.set(0,-18,0)

    world.add(flower3)

})

heroVideo.pause()

heroVideo.currentTime = 0

heroVideo.addEventListener("loadedmetadata",()=>{

    heroVideo.currentTime = 0

})

function setHover(){

    mouse.x = mouseX

    mouse.y = -mouseY

    raycaster.setFromCamera(mouse,camera)

    const targets=[]

    if(flower1) targets.push(flower1)
    if(flower2) targets.push(flower2)
    if(flower3) targets.push(flower3)

    const hits = raycaster.intersectObjects(targets,true)

    hovered = null

    if(hits.length){

        let obj = hits[0].object

        while(obj){

            if(obj===flower1){

                hovered = flower1
                break

            }

            if(obj===flower2){

                hovered = flower2
                break

            }

            if(obj===flower3){

                hovered = flower3
                break

            }

            obj = obj.parent

        }

    }

    if(flower1Info){

    flower1Info.classList.toggle(
        "show",
        hovered===flower1
    )

}

if(flower2Info){

    flower2Info.classList.toggle(
        "show",
        hovered===flower2
    )

}

if(flower3Info){

    flower3Info.classList.toggle(
        "show",
        hovered===flower3
    )

}

}

function animate(){

    requestAnimationFrame(animate)

    // -----------------------------
    // Hover
    // -----------------------------

    setHover()

    // -----------------------------
    // Scroll Smooth
    // -----------------------------

    currentY += (targetY - currentY) * 0.08

    // -----------------------------
    // Flower Position
    // -----------------------------

    let worldTarget = 0

    if(currentY < 18){

        worldTarget = 0

    }else if(currentY < 26){

        // 영상 끝 → Flower1
        worldTarget = (currentY - 18) * 0.25

    }else if(currentY < 31){

        // Flower1 중앙에서 잠깐 멈춤
        worldTarget = 2

    }else if(currentY < 39){

        // Flower2
        worldTarget = 2 + (currentY - 31) * 0.25

    }else if(currentY < 44){

        // Flower2 멈춤
        worldTarget = 4

    }else{

        // Flower3
        worldTarget = 4 + (currentY - 44) * 0.25

    }

    world.position.y +=
    (worldTarget - world.position.y) * 0.08

    // -----------------------------
    // Rotate World
    // -----------------------------

    targetRotX += velocityX
    targetRotY += velocityY

    velocityX *= .94
    velocityY *= .94

    world.rotation.x +=
    (targetRotX - world.rotation.x) * .08

    world.rotation.y +=
    (targetRotY - world.rotation.y) * .08

    // -----------------------------
    // Flowers
    // -----------------------------

    ;[flower1,flower2,flower3].forEach(model=>{

        if(!model) return

        model.rotation.y += .003

        model.rotation.y +=
        (mouseX*.2-model.rotation.y)*.03

        model.rotation.x +=
        (mouseY*.08-model.rotation.x)*.03

        gsap.to(model.scale,{

            x:hovered===model?1.42:1.3,

            y:hovered===model?1.42:1.3,

            z:hovered===model?1.42:1.3,

            duration:.25,

            overwrite:true

        })

    })

    // -----------------------------
    // Background
    // -----------------------------

    const t = performance.now()*0.001

    bg.position.x += (

        Math.sin(t*.6)*2

        + mouseX*.6

        - bg.position.x

    )*.02

    bg.position.y += (

        Math.cos(t*.45)*1

        + mouseY*.3

        - bg.position.y

    )*.02

    // 배경 크게 유지

    bg.scale.set(1.35,1.35,1)

    // -----------------------------
    // Glow
    // -----------------------------

    glow.rotation.z += .0005

    glow.material.opacity =

    .18 +

    Math.sin(t*2)*.05

    // -----------------------------
    // Light
    // -----------------------------

    point.intensity =

    2 +

    Math.sin(t*1.4)*.2

    renderer.render(scene,camera)

}


animate()
window.addEventListener("wheel",(e)=>{

    if(isMoving) return

    targetY += e.deltaY * 0.0035

    targetY = THREE.MathUtils.clamp(targetY,0,52)

    // -----------------------------
    // Hero Video Progress
    // -----------------------------

    const progress = Math.min(targetY / 18,1)

    if(heroVideo.duration){

        heroVideo.currentTime =
        heroVideo.duration * progress

    }

    heroVideo.style.opacity = 1

    heroEgg.style.opacity =
    progress < 0.02 ? 1 : 0

    // -----------------------------
    // Hero Fade
    // -----------------------------

    hero.style.opacity =

    Math.max(

        0,

        1 - (targetY / 22)

    )

    // -----------------------------
    // Background Fade
    // -----------------------------

    bg.material.opacity =

    Math.max(

        .25,

        1 - (targetY / 45)

    )

})
window.addEventListener("click",(event)=>{

    if(dragDistance>10) return

    mouse.x =
    (event.clientX/window.innerWidth)*2-1

    mouse.y =
    -(event.clientY/window.innerHeight)*2+1

    raycaster.setFromCamera(mouse,camera)

    const targets=[]

    if(flower1) targets.push(flower1)
    if(flower2) targets.push(flower2)
    if(flower3) targets.push(flower3)

    const hits =
    raycaster.intersectObjects(targets,true)

    if(!hits.length) return

    let obj = hits[0].object

    while(obj){

        if(obj===flower1){

            targetPage="/lamp.html"

            break

        }

        if(obj===flower2){

            targetPage="/tray.html"

            break

        }

        if(obj===flower3){

            targetPage="/still.html"

            break

        }

        obj=obj.parent

    }

    if(targetPage==="") return

    isMoving = true

    const fade =
    document.getElementById("fade")

    gsap.to(fade,{

        opacity:1,

        duration:.8,

        ease:"power2.out"

    })

    gsap.to(world.scale,{

        x:1.05,

        y:1.05,

        z:1.05,

        duration:.4,

        yoyo:true,

        repeat:1

    })

    setTimeout(()=>{

        window.location.href =
        targetPage

    },800)

})

window.addEventListener("mousedown",(e)=>{

    isDragging = true

    dragDistance = 0

    lastX = e.clientX

    lastY = e.clientY

})

window.addEventListener("mouseup",()=>{

    isDragging = false

})

window.addEventListener("mousemove",(e)=>{

    mouseX =
    (e.clientX/window.innerWidth-.5)*2

    mouseY =
    (e.clientY/window.innerHeight-.5)*2

    if(!isDragging) return

    const dx =
    e.clientX-lastX

    const dy =
    e.clientY-lastY

    dragDistance +=

    Math.abs(dx)+Math.abs(dy)

    velocityY = dx*0.003

    velocityX = dy*0.003

    lastX = e.clientX

    lastY = e.clientY

})

window.addEventListener("resize",()=>{

    camera.aspect =

    window.innerWidth/

    window.innerHeight

    camera.updateProjectionMatrix()

    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    )

    renderer.setPixelRatio(

        Math.min(

            window.devicePixelRatio,

            2

        )

    )

})
// -----------------------------
// Hero Video
// -----------------------------

heroVideo.addEventListener("ended",()=>{

    gsap.to(hero,{

        opacity:0,

        duration:.8,

        ease:"power2.out"

    })

})

// -----------------------------
// Loading
// -----------------------------

window.addEventListener("load",()=>{

    const loading =
    document.getElementById("loading")

    if(!loading) return

    gsap.to(".loading-bar",{

        width:"100%",

        duration:1.8,

        ease:"power2.out",

        onComplete:()=>{

            gsap.to(loading,{

                opacity:0,

                duration:.8,

                onComplete:()=>{

                    loading.remove()

                }

            })

        }

    })

})

// -----------------------------
// Performance
// -----------------------------

renderer.outputColorSpace =
THREE.SRGBColorSpace

renderer.shadowMap.enabled = false

renderer.setPixelRatio(

Math.min(

window.devicePixelRatio,

2

)

)

// renderer.setAnimationLoop(animate) disabled: animate() already uses requestAnimationFrame

// -----------------------------
// Idle Motion
// -----------------------------

let idle = 0

function updateIdle(){

    idle += .008

    world.rotation.z += (

        Math.sin(idle)*.01

        -

        world.rotation.z

    )*.05

}

const oldAnimate = animate

animate = function(){

    updateIdle()

    oldAnimate()

}

// -----------------------------
// Cursor
// -----------------------------

document.body.style.cursor = "default"

// -----------------------------
// Prevent Image Drag
// -----------------------------

document.querySelectorAll("img").forEach(img=>{

    img.draggable = false

})

// -----------------------------
// END
// -----------------------------