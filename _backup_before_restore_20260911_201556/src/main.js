import "./style.css"
import "./scene.js"

window.addEventListener("load",()=>{

    const loading =
    document.getElementById("loading")

    if(!loading) return

    setTimeout(()=>{

        loading.classList.add("loading-hide")

        setTimeout(()=>{

            loading.remove()

        },800)

    },1800)

})

window.addEventListener("contextmenu",(e)=>{

    e.preventDefault()

})

window.addEventListener("dragstart",(e)=>{

    e.preventDefault()

})

window.addEventListener("selectstart",(e)=>{

    e.preventDefault()

})
const cursor =
document.querySelector(".custom-cursor")

if(cursor){

    window.addEventListener("mousemove",(e)=>{

        cursor.style.left =
        e.clientX+"px"

        cursor.style.top =
        e.clientY+"px"

    })

    document
    .querySelectorAll("a,button,.flower-info")
    .forEach(item=>{

        item.addEventListener("mouseenter",()=>{

            cursor.style.width="34px"

            cursor.style.height="34px"

        })

        item.addEventListener("mouseleave",()=>{

            cursor.style.width="18px"

            cursor.style.height="18px"

        })

    })

}