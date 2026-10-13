import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

const world = new THREE.Group();
scene.add(world);

const loadingManager = new THREE.LoadingManager();
const loadingStartedAt = performance.now();
const loadingBar = document.querySelector(".loading-bar");
const loading = document.getElementById("loading");

loadingManager.onProgress = (_url, loaded, total) => {
    if (loadingBar && total) loadingBar.style.width = `${(loaded / total) * 100}%`;
};

loadingManager.onLoad = () => {
    if (!loading) return;
    if (loadingBar) loadingBar.style.width = "100%";
    const elapsed = performance.now() - loadingStartedAt;
    const wait = Math.max(0, 1200 - elapsed);
    window.setTimeout(() => {
        gsap.to(loading, {
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            onComplete: () => loading.remove()
        });
    }, wait);
};

const loader = new GLTFLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(10, 10);

const hero = document.querySelector(".hero");
const heroEgg = document.querySelector(".hero-egg");
const heroVideo = document.querySelector(".hero-video");
const heroContent = document.querySelector(".hero-content");
const flower1Info = document.getElementById("flower1-info");
const flower2Info = document.getElementById("flower2-info");
const flower3Info = document.getElementById("flower3-info");
const fade = document.getElementById("fade");
const finalFilm = document.getElementById("final-film");
// Black background stays clean; only the soft glow texture is used behind the objects.
const glowTexture = textureLoader.load("/assets/glow.png");
const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })
);
glow.position.set(0, 0, -3);
scene.add(glow);

const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(-6, 8, 7);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xcfe1ff, 1.35);
fillLight.position.set(6, 1, 4);
scene.add(fillLight);

scene.add(new THREE.HemisphereLight(0xe9f3ff, 0x172018, 1.15));
scene.add(new THREE.AmbientLight(0xffffff, 0.45));

const pointLight = new THREE.PointLight(0xffffff, 1.8, 35);
pointLight.position.set(0, 2, 8);
scene.add(pointLight);

let flower1 = null;
let flower2 = null;
let flower3 = null;
let hovered = null;
let isDragging = false;
let isMoving = false;
let dragDistance = 0;
let lastX = 0;
let lastY = 0;
let mouseX = 0;
let mouseY = 0;
let velocityX = 0;
let velocityY = 0;
let targetRotX = 0;
let targetRotY = 0;
let targetY = 0;
let currentY = 0;
let hoverDirty = true;
let hoverFrame = 0;

function setupModel(model, y) {
    model.position.set(0, y, 0);
    model.scale.setScalar(1.3);
    model.traverse((child) => {
        if (!child.isMesh) return;
        child.frustumCulled = true;
        if (child.material) child.material.needsUpdate = true;
    });
    world.add(model);
}

loader.load("/assets/flower1.glb", (gltf) => {
    flower1 = gltf.scene;
    setupModel(flower1, -6);
});

loader.load("/assets/flower2.glb", (gltf) => {
    flower2 = gltf.scene;
    setupModel(flower2, -12);
});

loader.load("/assets/flower3.glb", (gltf) => {
    flower3 = gltf.scene;
    setupModel(flower3, -18);
});

if (heroVideo) {
    heroVideo.pause();
    heroVideo.currentTime = 0;
    heroVideo.addEventListener("loadedmetadata", () => {
        heroVideo.currentTime = 0;
    });
}

function findRootModel(object) {
    while (object) {
        if (object === flower1 || object === flower2 || object === flower3) return object;
        object = object.parent;
    }
    return null;
}

function updateHover() {
    raycaster.setFromCamera(pointer, camera);
    const targets = [flower1, flower2, flower3].filter(Boolean);
    const hit = raycaster.intersectObjects(targets, true)[0];
    hovered = hit ? findRootModel(hit.object) : null;

    flower1Info?.classList.toggle("show", hovered === flower1);
    flower2Info?.classList.toggle("show", hovered === flower2);
    flower3Info?.classList.toggle("show", hovered === flower3);

    document.body.classList.toggle("object-hover", Boolean(hovered));
}

function scrollToWorldY(value) {
    // 0-18: hero / 18-26: flower 1 / 30-38: flower 2 / 42-50: flower 3
    if (value < 18) return 0;
    if (value < 26) return THREE.MathUtils.mapLinear(value, 18, 26, 0, 6);
    if (value < 30) return 6;
    if (value < 38) return THREE.MathUtils.mapLinear(value, 30, 38, 6, 12);
    if (value < 42) return 12;
    if (value < 50) return THREE.MathUtils.mapLinear(value, 42, 50, 12, 18);
    return 18;
}

function updateHero() {
    if (!hero || !heroVideo) return;

    const progress = THREE.MathUtils.clamp(targetY / 18, 0, 1);

    if (Number.isFinite(heroVideo.duration) && heroVideo.duration > 0) {
        const nextTime = heroVideo.duration * progress;
        if (Math.abs(heroVideo.currentTime - nextTime) > 0.05) heroVideo.currentTime = nextTime;
    }

    // First view stays pure black + typography. Video enters only after scrolling.
    const videoIn = THREE.MathUtils.smoothstep(progress, 0.12, 0.42);
    const typeOut = 1 - THREE.MathUtils.smoothstep(progress, 0.06, 0.30);
    const heroOut = 1 - THREE.MathUtils.smoothstep(progress, 0.78, 1);

    heroVideo.style.opacity = String(videoIn * 0.96);
    heroVideo.style.transform = `scale(${1.025 + progress * 0.025})`;
    if (heroEgg) {
        heroEgg.style.opacity = String(1 - THREE.MathUtils.smoothstep(progress, 0.08, 0.34));
        heroEgg.style.transform = `translate(-50%,-50%) scale(${1 + progress * 0.08})`;
    }
    if (heroContent) {
        heroContent.style.opacity = String(typeOut);
        heroContent.style.transform = `translate3d(0,${-progress * 26}px,0)`;
    }
    hero.style.opacity = String(heroOut);
    hero.style.pointerEvents = progress > 0.96 ? "none" : "auto";
}

function updateFinalFilm() {
    if (!finalFilm) return;

    const show = targetY >= 54;
    finalFilm.classList.toggle("show", show);
}

function animate() {
    currentY += (targetY - currentY) * 0.075;
    const worldTargetY = scrollToWorldY(currentY);
    world.position.y += (worldTargetY - world.position.y) * 0.075;

    targetRotX += velocityX;
    targetRotY += velocityY;
    velocityX *= 0.92;
    velocityY *= 0.92;

    world.rotation.x += (targetRotX - world.rotation.x) * 0.06;
    world.rotation.y += (targetRotY - world.rotation.y) * 0.06;
    world.rotation.z += (Math.sin(performance.now() * 0.0008) * 0.009 - world.rotation.z) * 0.04;

    [flower1, flower2, flower3].forEach((model) => {
        if (!model) return;
        const targetScale = hovered === model ? 1.42 : 1.3;
        model.scale.x += (targetScale - model.scale.x) * 0.12;
        model.scale.y += (targetScale - model.scale.y) * 0.12;
        model.scale.z += (targetScale - model.scale.z) * 0.12;
        if (!isDragging) model.rotation.y += 0.0022;
    });

    // Raycasting only when needed / at a low cadence while objects move.
    hoverFrame = (hoverFrame + 1) % 4;
    if (hoverDirty || (Math.abs(targetY - currentY) > 0.002 && hoverFrame === 0)) {
        updateHover();
        hoverDirty = false;
    }

    const t = performance.now() * 0.001;
    glow.rotation.z += 0.00045;
    glow.material.opacity = 0.17 + Math.sin(t * 1.7) * 0.035;
    glow.position.x += (mouseX * 0.35 - glow.position.x) * 0.025;
    glow.position.y += (mouseY * 0.18 - glow.position.y) * 0.025;
    pointLight.intensity = 1.8 + Math.sin(t * 1.2) * 0.16;

    updateFinalFilm();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("wheel", (event) => {
    if (isMoving) return;
    targetY = THREE.MathUtils.clamp(targetY + event.deltaY * 0.0036, 0, 74);
    updateHero();
}, { passive: true });

window.addEventListener("mousemove", (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    mouseX = pointer.x;
    mouseY = -pointer.y;
    hoverDirty = true;

    if (!isDragging) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    dragDistance += Math.abs(dx) + Math.abs(dy);
    velocityY = dx * 0.0025;
    velocityX = dy * 0.0025;
    lastX = event.clientX;
    lastY = event.clientY;
});

window.addEventListener("mousedown", (event) => {
    isDragging = true;
    dragDistance = 0;
    lastX = event.clientX;
    lastY = event.clientY;
});

window.addEventListener("mouseup", () => {
    isDragging = false;
});

window.addEventListener("mouseleave", () => {
    isDragging = false;
    pointer.set(10, 10);
});

window.addEventListener("click", (event) => {
    if (dragDistance > 10 || isMoving) return;

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const targets = [flower1, flower2, flower3].filter(Boolean);
    const hit = raycaster.intersectObjects(targets, true)[0];
    if (!hit) return;

    const selected = findRootModel(hit.object);
    const targetPage = selected === flower1
        ? "/lamp.html"
        : selected === flower2
            ? "/tray.html"
            : selected === flower3
                ? "/still.html"
                : "";

    if (!targetPage) return;
    isMoving = true;

    gsap.to(fade, { opacity: 1, duration: 0.65, ease: "power2.out" });
    gsap.to(world.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.35, yoyo: true, repeat: 1 });

    window.setTimeout(() => {
        window.location.href = targetPage;
    }, 650);
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
});

updateHero();
