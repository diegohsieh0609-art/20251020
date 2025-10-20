// --- 圓的設定 ---
let circles = [];
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
const NUM_CIRCLES = 20;

// 遊戲分數
let score = 0;

// 爆破效果的粒子系統
let particles = [];
let popSound; // 新增：爆破音效

// 新增粒子類別
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = 255;
    this.size = random(3, 8);
    this.speedX = random(-5, 5);
    this.speedY = random(-5, 5);
    this.life = 255;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 5;
    this.alpha = this.life;
  }

  draw() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    circle(this.x, this.y, this.size);
  }

  isDead() {
    return this.life <= 0;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 初始化圓
  circles = [];
  for (let i = 0; i < NUM_CIRCLES; i++) {
    let hex = random(COLORS);
    circles.push({
      x: random(width),
      y: random(height),
      r: random(50, 200),
      color: color(hex),
      hex: hex,                 // 儲存 原始色碼，便於判斷得分/懲罰
      alpha: random(80, 255),
      speed: random(1, 5)
    });
  }
}

function preload() {
  // 載入音效（檔案放在同一資料夾）
  popSound = loadSound('pop.mp3');
}

function createExplosion(x, y, originalColor) {
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle(x, y, originalColor));
  }
  // 播放爆破音效（確保已載入）
  if (popSound && typeof popSound.isLoaded === 'function') {
    if (popSound.isLoaded()) popSound.play();
  } else if (popSound) {
    try { popSound.play(); } catch (e) {}
  }
}

function draw() {
  background('#fcf6bd');
  noStroke();
  
  // 更新和繪製所有粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  for (let c of circles) {
    c.y -= c.speed;
    
    // 不再自動爆破：玩家點擊時才爆破

    // 若圓完全移出畫面頂端，從底部重新出現（不計分）
    if (c.y + c.r / 2 < 0) {
      c.y = height + c.r / 2;
      c.x = random(width);
      c.r = random(50, 200);
      let newHex = random(COLORS);
      c.color = color(newHex);
      c.hex = newHex;
      c.alpha = random(80, 255);
      c.speed = random(1, 5);
    }

    c.color.setAlpha(c.alpha);
    fill(c.color);
    circle(c.x, c.y, c.r);

    // 在圓的右上方1/4圓的中間產生方形（保留原視覺）
    let squareSize = c.r / 6;
    let angle = -PI / 4;
    let distance = c.r / 2 * 0.65;
    let squareCenterX = c.x + cos(angle) * distance;
    let squareCenterY = c.y + sin(angle) * distance;
    fill(255, 255, 255, 120);
    noStroke();
    rectMode(CENTER);
    rect(squareCenterX, squareCenterY, squareSize, squareSize);
  }

  // 顯示分數與學號（左上角）
  fill(30);
  textAlign(LEFT, TOP);
  textSize(18);
  text('分數: ' + score, 16, 16);
  textSize(14);
  text('學號: 414730886', 16, 40);
}

// 點擊處理：點中氣球則爆破並得/扣分，沒點中不處理
function mousePressed() {
  // 檢查所有氣泡，從最後一個開始（較接近上層）
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < c.r / 2) {
      // 點中了氣球：根據顏色給分或扣分
      createExplosion(c.x, c.y, c.color);

      if (c.hex === '#ff595e') {
        // 目標色：紅色 +10
        score += 10;
      } else if (c.hex === '#ffca3a') {
        // 懲罰色：黃色 -10
        score -= 10;
        if (score < 0) score = 0;
      } else {
        // 中性色 +2
        score += 2;
      }

      // 點擊後立即把氣球送回底部並隨機參數（避免重複點擊）
      c.y = height + c.r / 2;
      c.x = random(width);
      c.r = random(50, 200);
      let newHex = random(COLORS);
      c.color = color(newHex);
      c.hex = newHex;
      c.alpha = random(80, 255);
      c.speed = random(1, 5);

      break; // 一次只處理一個氣泡
    }
  }
}

// 支援行動裝置點擊
function touchStarted() {
  mousePressed();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新分布圓的位置
  for (let c of circles) {
    c.x = random(width);
    c.y = random(height);
  }
}