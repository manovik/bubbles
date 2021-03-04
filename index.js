const canvas = document.querySelector('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;
canvas.style.backgroundColor = 'rgba(240, 240, 240, 1)';
const ctx = canvas.getContext('2d');
const scoreBlock = document.getElementById('score');

let x = canvas.width / 2;
let y = canvas.height / 2;

class Player {
  constructor(x, y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle= this.color;
    ctx.fill();
  }
}

class Bullet {
  constructor(x, y, radius, color, velocity){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle= this.color;
    ctx.fill();
  }

  move(){
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle= this.color;
    ctx.fill();
    ctx.a
  }

  move(){
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class EnemiesPiece {
  constructor(x, y, radius, color, velocity){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.speedDown = .99;
  }

  draw(){
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle= this.color;
    ctx.fill();
    ctx.restore()
  }

  move(){
    this.draw();
    this.velocity.x *= this.speedDown; 
    this.velocity.y *= this.speedDown; 
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= .01
  }
}

let player = new Player(x, y, 25, '#fff');
let bullets = [];
let enemies = [];
let enemiesPieces = [];
let score = 0;
scoreBlock.textContent = score;
let gameOver = false;

const startBtn = document.getElementById('start')

function animate(){
  const animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0,0,0,.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  player.draw();

  enemiesPieces.forEach((piece, i) => {
    if(piece.alpha < 0) {
      setTimeout(() => {
        enemiesPieces.splice(i, 1)
      }, 4);
    } else {
      piece.move();
    }
  });

  bullets.forEach((bullet, i) => {
    bullet.move();
    if(bullet.x - bullet.radius <= 0 ||
        bullet.x + bullet.radius >= canvas.width ||
        bullet.y - bullet.radius <= 0 ||  
        bullet.y + bullet.radius >= canvas.height ) {
      setTimeout(() => {
        bullets.splice(i, 1)
      }, 4);
    }
  });

  enemies.forEach((enemy, i) => {
    // end of game
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if(dist - player.radius - enemy.radius < 0) {
      cancelAnimationFrame(animationId);
      gameOver = true;
      document.getElementById('modal').classList.remove('hidden');
      document.getElementById('scorePoints').textContent = score;

    }

    enemy.move();

    bullets.forEach((bullet, j) => {
      // kill enemies
      const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
      if(dist - bullet.radius - enemy.radius < 0) {
        // create explosion
        for (let i = 0; i < enemy.radius * 2; i++) {
          enemiesPieces.push(new EnemiesPiece(
            enemy.x,
            enemy.y,
            Math.random() * 2,
            enemy.color,
            {
              x: (Math.random() - .5) * (Math.random() * 4),
              y: (Math.random() - .5) * (Math.random() * 4)
            }
          ))
        }

        if(enemy.radius < player.radius) {
          score += 25;
          scoreBlock.textContent = score
          setTimeout(() => {
            enemies.splice(i, 1)
            bullets.splice(j, 1)
          }, 4);
        } else {
          bullets.splice(j, 1)
          enemy.radius -= enemy.radius * .1
          score += 10;
          scoreBlock.textContent = score
        }
      }
    });
  });
}

function spawnEnemy() {
  const intervalId = setInterval(() => {
    const rad = Math.random() * (30 - 4) + 4;
    let x, y;
    if (Math.random() < .5) {
      x = Math.random() < .5 ? 0 - rad : canvas.width + rad;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < .5 ? 0 - rad : canvas.height + rad;
    }

    const color = `hsl(
      ${Math.floor(Math.random() * 360)}, 
      ${Math.floor(Math.random() * 70 + 30)}%,
      50%
      )`;
    const angle = Math.atan2(
      canvas.height / 2 - y,
      canvas.width / 2 - x
    )
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }
    
    const enemy = new Enemy(x, y, rad, color, velocity);
    enemies.push(enemy);
    if(gameOver) {
      clearInterval(intervalId);
    }
  }
  , 1000);
  return intervalId;
}


startBtn.addEventListener('click', () => {
  init();
  animate();
  spawnEnemy();
  document.getElementById('modal').classList.add('hidden');
});

function init() {
  player = new Player(x, y, 25, '#fff');
  bullets = [];
  enemies = [];
  enemiesPieces = [];
  score = 0;
  scoreBlock.textContent = score;
  gameOver = false;
}

addEventListener('click', e => {
  const xB = canvas.width / 2;
  const yB = canvas.height / 2;
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  )
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  const bullet = new Bullet(xB, yB, 5, '#fff', velocity);
    
  bullets.push(bullet);
});

animate();
spawnEnemy();



//////////////////////

addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  player.x = canvas.width / 2;
  player.y = canvas.height / 2; 
  player.draw();
})
