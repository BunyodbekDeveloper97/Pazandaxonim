const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultText = document.getElementById('resultText');
const tableBody = document.querySelector("#historyTable tbody");
const clearBtn = document.getElementById('clearBtn');

// Asosiy ro'yxat
let taomlar = [ "Osh (Palov)", "Moshkichiri", "Manti", "Somsa", "Lag'mon", "Shurva",
    "Qozon Kabob", "Shashlik", "Dimlama", "Mastava", "Chuchvara",
    "Norin", "Xonim", "Moshxurda", "Galupsi", "Baliq qovurma",
    "Karam Do'lma", "Qotirma", "Makaron Palov", "Lavash va KFC", "Pizza",
    "Karam Dulma", "Baliq Shurva", "Nuxot Shurva", "Jiz-biz", "Grechka", "Garoh Shurva",];
const colors = ["#4a2c2a", "#d4af37", "#1b4d3e", "#8b0000", "#5d4037", "#c5a059", "#2c3e50", "#a0522d"];

let currentRotation = 0;
let history = JSON.parse(localStorage.getItem('dishHistory')) || [];

// G'ildirakni chizish funksiyasi
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 15;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (taomlar.length === 0) {
        resultText.innerText = "Hamma taomlar tanlab bo'lindi!";
        spinBtn.disabled = true;
        spinBtn.innerText = "Tugadi";
        return;
    }

    const arc = (Math.PI * 2) / taomlar.length;

    taomlar.forEach((taom, i) => {
        const angle = i * arc;
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Montserrat";
        ctx.fillText(taom, radius - 30, 10);
        ctx.restore();
    });
}

// Jadvalni yangilash
function updateTable() {
    tableBody.innerHTML = "";
    history.slice().reverse().forEach((item, index) => {
        const row = `<tr>
            <td>${history.length - index}</td>
            <td>${item.name}</td>
            <td>${item.time}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

spinBtn.addEventListener('click', () => {
    if (taomlar.length === 0) return;

    spinBtn.disabled = true;
    resultText.innerText = "Tanlanmoqda...";
    
    const randomSpin = Math.floor(Math.random() * 360) + 3600;
    currentRotation += randomSpin;
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        spinBtn.disabled = false;
        
        const actualDeg = currentRotation % 360;
        const arcDeg = 360 / taomlar.length;
        // Markaziy (pointer) pozitsiyaga moslashtirilgan indeks hisobi
        const index = Math.floor((360 - (actualDeg % 360) + 270) % 360 / arcDeg);
        
        const chosenDish = taomlar[index];
        resultText.innerText = "Bugun: " + chosenDish;
        
        // Tarixga qo'shish
        const now = new Date();
        const time = now.getHours() + ":" + now.getMinutes().toString().padStart(2, '0');
        history.push({ name: chosenDish, time: time });
        localStorage.setItem('dishHistory', JSON.stringify(history));
        updateTable();

        // --- ENG MUHIM QISM: Tanlangan taomni o'chirish ---
        taomlar.splice(index, 1); // Ro'yxatdan olib tashlash
        
        // G'ildirakni yangi ro'yxat bilan qayta chizish (ozgina kechikish bilan silliq ko'rinishi uchun)
        setTimeout(() => {
            canvas.style.transition = "none"; // Animatsiyani vaqtincha o'chirish
            currentRotation = 0; // Rotatsiyani nolga qaytarish
            canvas.style.transform = `rotate(0deg)`;
            drawWheel();
            setTimeout(() => {
                canvas.style.transition = "transform 4s cubic-bezier(0.15, 0, 0.15, 1)";
            }, 50);
        }, 1500);

    }, 4000);
});

clearBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('dishHistory');
    updateTable();
    // Tarix tozalanganda taomlarni qayta tiklashni xohlasangiz:
    location.reload(); 
});

window.onload = () => {
    drawWheel();
    updateTable();
};
