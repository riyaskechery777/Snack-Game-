class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{x: 10, y: 10}];
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
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.init();
    }
    
    init() {
        this.updateHighScoreDisplay();
        this.generateFood();
        this.draw();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Button controls
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    handleKeyPress(e) {
        const key = e.key;
        const keyMap = {
            'ArrowUp': 'UP',
            'ArrowDown': 'DOWN',
            'ArrowLeft': 'LEFT',
            'ArrowRight': 'RIGHT',
            'w': 'UP',
            's': 'DOWN',
            'a': 'LEFT',
            'd': 'RIGHT'
        };
        
        if (keyMap[key]) {
            e.preventDefault();
            const newDirection = keyMap[key];
            this.changeDirection(newDirection);
        }
        
        // Space bar to pause/unpause
        if (key === ' ' || key === 'Space') {
            e.preventDefault();
            if (this.isRunning && !this.isPaused) {
                this.togglePause();
            } else if (this.isRunning && this.isPaused) {
                this.togglePause();
            }
        }
    }
    
    changeDirection(newDirection) {
        const oppositeDirections = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        
        if (oppositeDirections[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        this.direction = this.nextDirection;
        
        // Move snake
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'UP': head.y--; break;
            case 'DOWN': head.y++; break;
            case 'LEFT': head.x--; break;
            case 'RIGHT': head.x++; break;
        }
        
        this.snake.unshift(head);
        
        // Check collision with food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.scoreElement.textContent = this.score;
            this.generateFood();
            
            // Update high score
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('snakeHighScore', this.highScore);
                this.updateHighScoreDisplay();
            }
        } else {
            this.snake.pop();
        }
        
        // Check collisions
        if (this.checkCollision()) {
            this.gameOver();
        }
    }
    
    checkCollision() {
        const head = this.snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        
        return false;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            
            if (index === 0) {
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#45a049');
            } else {
                gradient.addColorStop(0, '#66BB6A');
                gradient.addColorStop(1, '#4CAF50');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
            
            // Draw eyes on head
            if (index === 0) {
                this.ctx.fillStyle = 'white';
                const eyeSize = 3;
                const eyeOffset = 5;
                
                if (this.direction === 'RIGHT') {
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset, segment.y * this.gridSize + this.gridSize - 8, eyeSize, eyeSize);
                } else if (this.direction === 'LEFT') {
                    this.ctx.fillRect(segment.x * this.gridSize + 2, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 2, segment.y * this.gridSize + this.gridSize - 8, eyeSize, eyeSize);
                } else if (this.direction === 'UP') {
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 2, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - 8, segment.y * this.gridSize + 2, eyeSize, eyeSize);
                } else {
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + this.gridSize - 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - 8, segment.y * this.gridSize + this.gridSize - 5, eyeSize, eyeSize);
                }
            }
        });
        
        // Draw food
        this.ctx.fillStyle = '#FF5252';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#FF5252';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
        this.ctx.shadowBlur = 0;
        
        // Draw grid
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
        
        // Draw pause overlay
        if (this.isPaused && this.isRunning) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
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
        
        if (!this.isPaused) {
            this.draw();
        }
    }
    
    resetGame() {
        clearInterval(this.gameLoop);
        this.snake = [{x: 10, y: 10}];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.scoreElement.textContent = this.score;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        
        this.generateFood();
        this.draw();
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.isRunning = false;
        
        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FF5252';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click "Start Game" to play again', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }
    
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
