const cursor = document.createElement("img")

cursor.src = `${import.meta.env.BASE_URL}assets/cursor.png`

cursor.style.position = "fixed"
cursor.style.left = "100px"
cursor.style.top = "100px"
cursor.style.width = "60px"
cursor.style.height = "60px"
cursor.style.zIndex = "9999999999"
cursor.style.pointerEvents = "none"
cursor.style.transform = "translate(-50%, -50%)"

document.body.appendChild(cursor)

cursor.onload = () => {
    console.log("이미지 로드 성공")
}

cursor.onerror = () => {
    console.log("이미지 로드 실패")
}

window.addEventListener("mousemove",(e)=>{

    cursor.style.left = e.clientX + "px"
    cursor.style.top = e.clientY + "px"

})