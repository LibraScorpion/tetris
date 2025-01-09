class Game {
    constructor() {
        // 初始化游戏组件
        this.board = new Board(10, 20);
        this.renderer = new Renderer(
            document.getElementById('gameCanvas'),
            document.getElementById('nextCanvas')
        );
        
        // 游戏状态
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameOver = false;
        this.isPaused = false;
        
        // 动画帧请求ID
        this.animationId = null;
        
        // 上次更新时间
        this.lastTime = 0;
        
        // 下落时间间隔（毫秒）
        this.dropInterval = 1000;
        
        // 绑定按钮事件
        this.bindButtons();
        
        // 绑定键盘事件
        this.bindKeyEvents();
    }

    // 绑定按钮事件
    bindButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        startBtn.addEventListener('click', () => {
            if (this.isGameOver) {
                this.reset();
            }
            this.start();
        });
        
        pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });
    }

    // 绑定键盘事件
    bindKeyEvents() {
        document.addEventListener('keydown', (event) => {
            if (this.isGameOver) return;
            
            switch (event.code) {
                case 'ArrowLeft':
                    if (!this.isPaused) {
                        this.board.movePiece(-1, 0);
                        this.render();
                    }
                    break;
                case 'ArrowRight':
                    if (!this.isPaused) {
                        this.board.movePiece(1, 0);
                        this.render();
                    }
                    break;
                case 'ArrowDown':
                    if (!this.isPaused) {
                        if (this.board.movePiece(0, 1)) {
                            this.score += 1;
                            this.updateScore();
                        }
                        this.render();
                    }
                    break;
                case 'ArrowUp':
                    if (!this.isPaused) {
                        this.board.rotatePiece();
                        this.render();
                    }
                    break;
                case 'Space':
                    if (!this.isPaused && !this.isGameOver) {
                        const dropDistance = this.board.hardDrop();
                        this.score += dropDistance * 2;
                        this.updateScore();
                        this.lockAndSpawnNewPiece();
                        this.render();
                    } else {
                        this.togglePause();
                    }
                    break;
            }
        });
    }

    // 开始游戏
    start() {
        if (!this.animationId) {
            this.reset();
            this.lastTime = performance.now();
            this.animate();
            document.getElementById('startBtn').textContent = '重新开始';
        }
    }

    // 重置游戏
    reset() {
        this.board.reset();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.dropInterval = 1000;
        this.updateScore();
        this.updateLevel();
        this.board.spawn();
    }

    // 切换暂停状态
    togglePause() {
        if (!this.isGameOver) {
            this.isPaused = !this.isPaused;
            document.getElementById('pauseBtn').textContent = 
                this.isPaused ? '继续' : '暂停';
            
            if (this.isPaused) {
                this.renderer.renderPaused();
            } else {
                this.render();
            }
        }
    }

    // 游戏主循环
    animate(currentTime = 0) {
        if (this.isGameOver) {
            this.renderer.renderGameOver();
            return;
        }
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        if (this.isPaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime > this.dropInterval) {
            this.update();
            this.lastTime = currentTime;
        }
    }

    // 更新游戏状态
    update() {
        if (!this.board.movePiece(0, 1)) {
            this.lockAndSpawnNewPiece();
        }
        this.render();
    }

    // 锁定当前方块并生成新方块
    lockAndSpawnNewPiece() {
        this.board.lockPiece();
        const linesCleared = this.board.clearLines();
        
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
            this.lines += linesCleared;
            this.renderer.updateLines(this.lines);
            
            // 更新等级
            const newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel !== this.level) {
                this.level = newLevel;
                this.updateLevel();
                // 加快下落速度
                this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            }
        }
        
        // 生成新方块，如果无法生成则游戏结束
        if (!this.board.spawn()) {
            this.gameOver();
        }
    }

    // 更新分数
    updateScore(linesCleared = 0) {
        // 计算消行得分
        if (linesCleared > 0) {
            // 使用经典俄罗斯方块的计分系统
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
        }
        
        this.renderer.updateScore(this.score);
    }

    // 更新等级
    updateLevel() {
        this.renderer.updateLevel(this.level);
    }

    // 渲染游戏画面
    render() {
        this.renderer.renderBoard(this.board);
        this.renderer.renderNextPiece(this.board.nextPiece);
    }

    // 游戏结束
    gameOver() {
        this.isGameOver = true;
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.renderer.renderGameOver();
        document.getElementById('startBtn').textContent = '开始新游戏';
    }
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});