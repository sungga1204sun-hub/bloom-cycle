console.log("tray.js 실행됨")
import * as THREE from "three"
import "./tray.css"
import "./cursor.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const scene = new THREE.Scene()

scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
)

camera.position.x = 0.5
camera.position.y = 0.2
camera.position.z = 7

const renderer = new THREE.WebGLRenderer({
    antialias:true
})

renderer.setSize(window.innerWidth,window.innerHeight)

document.body.appendChild(renderer.domElement)
// 메인 조명
const keyLight = new THREE.DirectionalLight(0xffffff, 5)
keyLight.position.set(5, 5, 5)
scene.add(keyLight)

// 반대편 조명
const fillLight = new THREE.DirectionalLight(0xffffff, 1.5)
fillLight.position.set(-5, 2, 3)
scene.add(fillLight)

// 뒤쪽 조명
const backLight = new THREE.DirectionalLight(0xffffff, 3)
backLight.position.set(0, 3, -5)
scene.add(backLight)

// 전체 밝기
scene.add(new THREE.AmbientLight(0xffffff, 0.8))
const loader = new GLTFLoader()

let tray
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
loader.load("/assets/tray.glb",

    (gltf)=>{

        console.log("GLB 성공")

        tray = gltf.scene

        tray.traverse((child)=>{

    if(child.isMesh){

        child.castShadow = true
        child.receiveShadow = true

    }

})
        tray.scale.set(1.9,1.9,1.9)

        tray.position.set(-2.3,-0.1,0)
      tray.rotation.y = Math.PI / 6
targetRotY = Math.PI / 6
        tray.rotation.x = 0.1

        scene.add(tray)
        const box = new THREE.Box3().setFromObject(tray)
console.log(box)
console.log(box.getCenter(new THREE.Vector3()))
console.log(box.getSize(new THREE.Vector3()))

    },

    undefined,

    (error)=>{

        console.log("GLB 실패", error)

    }

)
function animate(){

    requestAnimationFrame(animate)

    if(tray){
const t = clock.getElapsedTime()


    tray.rotation.y += ((targetRotY + mouseX * 0.35) - tray.rotation.y) * 0.08

    tray.rotation.x += ((targetRotX + mouseY * 0.15) - tray.rotation.x) * 0.08

    if(!isDragging){

        velocityX *= 0.95
        velocityY *= 0.95

        targetRotX += velocityX
        targetRotY += velocityY

    }

}
camera.position.z += (targetZoom - camera.position.z) * 0.08
    renderer.render(scene,camera)

}

animate()
window.addEventListener("resize",()=>{

    camera.aspect = window.innerWidth/window.innerHeight

    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth,window.innerHeight)

})
renderer.setPixelRatio(window.devicePixelRatio)
window.addEventListener("mousedown",(e)=>{

    isDragging = true

    lastX = e.clientX
    lastY = e.clientY

})

window.addEventListener("mouseup",()=>{

    isDragging = false

})
window.addEventListener("mousemove",(e)=>{

    mouseX = (e.clientX / window.innerWidth - 0.5) * 2
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2

})
window.addEventListener("mousemove",(e)=>{

    if(!isDragging) return

    const dx = e.clientX - lastX
    const dy = e.clientY - lastY

    velocityY = dx * 0.003
    velocityX = dy * 0.003

    targetRotY += velocityY
    targetRotX += velocityX

    lastX = e.clientX
    lastY = e.clientY

})
window.addEventListener("wheel",(e)=>{

    targetZoom += e.deltaY * 0.003

    targetZoom = Math.max(5.5, Math.min(8.5, targetZoom))
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.outputColorSpace = THREE.SRGBColorSpace