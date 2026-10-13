console.log("lamp.js 실행됨")
import * as THREE from "three"
import "./lamp.css"
import "./cursor.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 7
camera.position.x = -0.5
camera.position.y = 0.2
const renderer = new THREE.WebGLRenderer({ antialias:true })
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)
const keyLight = new THREE.DirectionalLight(0xffffff, 5)
keyLight.position.set(5, 5, 5)
scene.add(keyLight)
const fillLight = new THREE.DirectionalLight(0xffffff, 1.5)
fillLight.position.set(-5, 2, 3)
scene.add(fillLight)
const backLight = new THREE.DirectionalLight(0xffffff, 3)
backLight.position.set(0, 3, -5)
scene.add(backLight)
scene.add(new THREE.AmbientLight(0xffffff, 0.8))
const loader = new GLTFLoader()
let lamp
const clock = new THREE.Clock()
let targetZoom = 7
let isDragging = false
let lastX = 0
let lastY = 0
let targetRotX = 0
let targetRotY = 0
let velocityX = 0
let velocityY = 0
let mouseX = 0
let mouseY = 0
function applyResponsiveLayout(){
    const mobile = window.innerWidth <= 768
    if(!lamp) return
    if(mobile){ lamp.scale.set(1.75,1.75,1.75); lamp.position.x = 0.45; lamp.position.y = 0.55; targetZoom = 7.8 }
    else { lamp.scale.set(2.5,2.5,2.5); lamp.position.x = 2.3; lamp.position.y = 0; targetZoom = 7 }
}
loader.load(`${import.meta.env.BASE_URL}assets/lamp.glb`, (gltf)=>{
    console.log("GLB 성공")
    lamp = gltf.scene
    lamp.traverse((child)=>{ if(child.isMesh){ child.castShadow = true; child.receiveShadow = true } })
    lamp.scale.set(2.5,2.5,2.5)
    lamp.position.set(2.3,0,0)
    lamp.rotation.y = -0.35
    lamp.rotation.x = 0.1
    scene.add(lamp)
    applyResponsiveLayout()
}, undefined, (error)=>{ console.log("GLB 실패", error) })
function animate(){
    requestAnimationFrame(animate)
    if(lamp){
        const t = clock.getElapsedTime()
        lamp.position.y = Math.sin(t * 1.2) * 0.08
        lamp.rotation.y += ((targetRotY + mouseX * 0.15) - lamp.rotation.y) * 0.08
        lamp.rotation.x += ((targetRotX + mouseY * 0.08) - lamp.rotation.x) * 0.08
        if(!isDragging){ velocityX *= 0.95; velocityY *= 0.95; targetRotX += velocityX; targetRotY += velocityY }
    }
    camera.position.z += (targetZoom - camera.position.z) * 0.08
    renderer.render(scene,camera)
}
animate()
window.addEventListener("resize",()=>{ camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); applyResponsiveLayout() })
renderer.setPixelRatio(window.devicePixelRatio)
window.addEventListener("mousedown",(e)=>{ isDragging = true; lastX = e.clientX; lastY = e.clientY })
window.addEventListener("mouseup",()=>{ isDragging = false })
window.addEventListener("mousemove",(e)=>{ mouseX = (e.clientX / window.innerWidth - 0.5) * 2; mouseY = (e.clientY / window.innerHeight - 0.5) * 2 })
window.addEventListener("mousemove",(e)=>{ if(!isDragging) return; const dx = e.clientX - lastX; const dy = e.clientY - lastY; velocityY = dx * 0.003; velocityX = dy * 0.003; targetRotY += velocityY; targetRotX += velocityX; lastX = e.clientX; lastY = e.clientY })
window.addEventListener("wheel",(e)=>{ targetZoom += e.deltaY * 0.003; targetZoom = Math.max(5.5, Math.min(8.5, targetZoom)) })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
window.addEventListener("touchstart",(e)=>{ if(!e.touches.length) return; isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY },{passive:true})
window.addEventListener("touchmove",(e)=>{ if(!isDragging || !e.touches.length) return; const x = e.touches[0].clientX; const y = e.touches[0].clientY; const dx = x - lastX; const dy = y - lastY; velocityY = dx * 0.004; velocityX = dy * 0.004; targetRotY += velocityY; targetRotX += velocityX; lastX = x; lastY = y },{passive:true})
window.addEventListener("touchend",()=>{ isDragging = false },{passive:true})
