import { gsap } from "gsap"

let targetZ = 5

window.addEventListener("wheel", (e) => {

    if (!window.camera) return

    targetZ += e.deltaY * 0.003

    targetZ = Math.max(2.2, Math.min(6, targetZ))

    gsap.to(window.camera.position, {
        z: targetZ,
        duration: 0.8,
        ease: "power3.out"
    })

})