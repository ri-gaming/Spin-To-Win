const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const adminPanel = document.getElementById("adminPanel");
const segmentList = document.getElementById("segmentList");
let segments = JSON.parse(localStorage.getItem("segments")) || [
    { name: "Perfume Sample", probability: 40 },
    { name: "₹100 Off Coupon", probability: 35 },
    { name: "Free Gift Wrap", probability: 25 },
    { name: "Luxury Perfume Set (Showpiece)", probability: 0 }
];
let startAngle = 0;
let spinning = false;

// Draw Wheel
function drawWheel() {
    const arc = (2 * Math.PI) / segments.length;
    segments.forEach((segment, i) => {
        const angle = startAngle + i * arc;
        ctx.beginPath();
        ctx.fillStyle = i % 2 === 0 ? "#ff6f91" : "#ffc1cc";
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 150, angle, angle + arc);
        ctx.fill();
        ctx.save();
        ctx.translate(150, 150);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Arial";
        ctx.fillText(segment.name, 140, 5);
        ctx.restore();
    });
}
drawWheel();

// Pick reward based on probability
function pickReward() {
    const total = segments.reduce((sum, seg) => sum + seg.probability, 0);
    const rand = Math.random() * total;
    let cumulative = 0;
    for (let seg of segments) {
        cumulative += seg.probability;
        if (rand <= cumulative) return seg;
    }
}

// Spin
spinBtn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    const reward = pickReward();
    const arc = 360 / segments.length;
    const rewardIndex = segments.findIndex(s => s.name === reward.name);
    const randomOffset = Math.random() * arc;
    const targetAngle = (360 * 5) + (rewardIndex * arc) + randomOffset;

    let rotation = 0;
    const spinInterval = setInterval(() => {
        rotation += 20;
        if (rotation >= targetAngle) {
            clearInterval(spinInterval);
            spinning = false;
            alert(`🎉 You won: ${reward.name}`);
        }
        startAngle = (rotation * Math.PI) / 180;
        drawWheel();
    }, 20);
});

// Hold 10 sec to open admin panel
let holdTimer;
spinBtn.addEventListener("mousedown", () => {
    holdTimer = setTimeout(openAdminPanel, 10000);
});
spinBtn.addEventListener("mouseup", () => clearTimeout(holdTimer));
spinBtn.addEventListener("touchstart", () => {
    holdTimer = setTimeout(openAdminPanel, 10000);
});
spinBtn.addEventListener("touchend", () => clearTimeout(holdTimer));

function openAdminPanel() {
    segmentList.innerHTML = "";
    segments.forEach((seg, i) => {
        const div = document.createElement("div");
        div.className = "segment-input";
        div.innerHTML = `
            <input type="text" value="${seg.name}" data-index="${i}" data-type="name">
            <input type="number" value="${seg.probability}" data-index="${i}" data-type="probability" min="0" max="100">
        `;
        segmentList.appendChild(div);
    });
    adminPanel.classList.remove("hidden");
}

// Add segment
document.getElementById("addSegment").addEventListener("click", () => {
    segments.push({ name: "New Segment", probability: 0 });
    openAdminPanel();
});

// Save settings
document.getElementById("saveSettings").addEventListener("click", () => {
    document.querySelectorAll(".segment-input input").forEach(input => {
        const index = input.dataset.index;
        const type = input.dataset.type;
        segments[index][type] = type === "probability" ? parseFloat(input.value) : input.value;
    });
    localStorage.setItem("segments", JSON.stringify(segments));
    adminPanel.classList.add("hidden");
    drawWheel();
});
