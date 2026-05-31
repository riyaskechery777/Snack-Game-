class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Responsive canvas
        this.gridSize = 20;
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());

        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.food = {};
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 100;

        // DOM elements
        this.scoreElement = document.getElementById("score"); // FIXED
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');

        this.init();
    }

    resizeCanvas() {
        let size = Math.min(window.innerWidth * 0.9, 400);
        this.canvas.width = size;
        this.canvas.height = size;

        this.tileCount = Math.floor(this.canvas.width / this.gridSize);
        this.draw();
    }

    init() {
        this.updateHighScoreDisplay();
        this.generateFood();
        this.draw();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }

    // ✅ UPDATED CONTROLS (your logic safely added)
    handleKeyPress(e) {
        const key = e.key;

        if (key === "ArrowUp" || key === "w") {
            this.changeDirection("UP");
        } 
        else if (key === "ArrowDown" || key === "s") {
            this.changeDirection("DOWN");
        } 
        else if (key === "ArrowLeft" || key === "a") {
            this.changeDirection("LEFT");
        } 
        else if (key === "ArrowRight" || key === "d") {
            this.changeDirection("RIGHT");
        }

        // Pause / Resume
        if (key === " " || key === "Space") {
            e.preventDefault();
            this.togglePause();
        }
    }

    changeDirection(newDirection) {
        const opposite = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };

        if (opposite[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }

    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y));
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        this.direction = this.nextDirection;

        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'UP': head.y--; break;
            case 'DOWN': head.y++; break;
            case 'LEFT': head.x--; break;
            case 'RIGHT': head.x++; break;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.scoreElement.textContent = this.score;
            this.generateFood();

            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('snakeHighScore', this.highScore);
                this.updateHighScoreDisplay();
            }
        } else {
            this.snake.pop();
        }

        if (this.checkCollision()) {
            this.gameOver();
        }
    }

    checkCollision() {
        const head = this.snake[0];

        if (
            head.x < 0 ||
            head.x >= this.tileCount ||
            head.y < 0 ||
            head.y >= this.tileCount
        ) return true;

        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }

        return false;
    }

    draw() {
        this.ctx.imageSmoothingEnabled = false;

        // Clear
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Snake
        this.snake.forEach((seg, i) => {
            const gradient = this.ctx.createLinearGradient(
                seg.x * this.gridSize,
                seg.y * this.gridSize,
                (seg.x + 1) * this.gridSize,
                (seg.y + 1) * this.gridSize
            );

            if (i === 0) {
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#45a049');
            } else {
                gradient.addColorStop(0, '#66BB6A');
                gradient.addColorStop(1, '#4CAF50');
            }

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                seg.x * this.gridSize,
                seg.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Food
        this.ctx.fillStyle = '#FF5252';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );

        // Grid
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Pause screen
        if (this.isPaused && this.isRunning) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    startGame() {
        clearInterval(this.gameLoop);

        this.isRunning = true;
        this.isPaused = false;

        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speed);

        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
    }

    togglePause() {
        if (!this.isRunning) return;

        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    resetGame() {
        clearInterval(this.gameLoop);

        this.snake = [{ x: 10, y: 10 }];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.score = 0;

        this.scoreElement.textContent = this.score;

        this.isRunning = false;
        this.isPaused = false;

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';

        this.generateFood();
        this.draw();
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isRunning = false;

        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#FF5252';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
}

// Start game
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});