class Renderer {
    constructor(gameCanvas, nextCanvas) {
        this.gameCanvas = gameCanvas;
        this.nextCanvas = nextCanvas;
        this.gameCtx = gameCanvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        
        // 计算单个方块的大小
        this.blockSize = gameCanvas.width / 10;
        this.nextBlockSize = nextCanvas.width / 4;
        
        // 设置线条样式
        this.gameCtx.lineWidth = 1;
        this.nextCtx.lineWidth = 1;
    }

    // 清空画布
    clear() {
        this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    }

    // 绘制网格
    drawGrid() {
        this.gameCtx.strokeStyle = '#2c3e50';
        this.gameCtx.beginPath();
        
        // 绘制垂直线
        for (let x = 0; x <= this.gameCanvas.width; x += this.blockSize) {
            this.gameCtx.moveTo(x, 0);
            this.gameCtx.lineTo(x, this.gameCanvas.height);
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.gameCanvas.height; y += this.blockSize) {
            this.gameCtx.moveTo(0, y);
            this.gameCtx.lineTo(this.gameCanvas.width, y);
        }
        
        this.gameCtx.stroke();
    }

    // 绘制单个方块
    drawBlock(ctx, x, y, color, size, isGhost = false) {
        const blockSize = size || this.blockSize;
        
        // 绘制方块主体
        ctx.fillStyle = color;
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        if (!isGhost) {
            // 绘制高光效果
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(
                x * blockSize, 
                y * blockSize, 
                blockSize, 
                blockSize / 4
            );
            
            // 绘制边框
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.strokeRect(
                x * blockSize, 
                y * blockSize, 
                blockSize, 
                blockSize
            );
        }
    }

    // 渲染游戏板状态
    renderBoard(board) {
        this.clear();
        this.drawGrid();
        
        // 渲染已固定的方块
        const state = board.getState();
        for (let y = 0; y < state.length; y++) {
            for (let x = 0; x < state[y].length; x++) {
                const cell = state[y][x];
                if (cell) {
                    const isGhost = cell.color.endsWith('40');
                    this.drawBlock(
                        this.gameCtx, 
                        x, 
                        y, 
                        cell.color,
                        this.blockSize,
                        isGhost
                    );
                }
            }
        }
    }

    // 渲染下一个方块预览
    renderNextPiece(piece) {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!piece) return;
        
        const box = piece.getBoundingBox();
        const offsetX = (4 - box.width) / 2;
        const offsetY = (4 - box.height) / 2;
        
        piece.getCells().forEach(cell => {
            this.drawBlock(
                this.nextCtx,
                cell.x - piece.x + offsetX,
                cell.y - piece.y + offsetY,
                piece.color,
                this.nextBlockSize
            );
        });
    }

    // 更新分数显示
    updateScore(score) {
        document.getElementById('score').textContent = score;
    }

    // 更新等级显示
    updateLevel(level) {
        document.getElementById('level').textContent = level;
    }

    // 更新已消除行数显示
    updateLines(lines) {
        document.getElementById('lines').textContent = lines;
    }

    // 渲染游戏结束画面
    renderGameOver() {
        const ctx = this.gameCtx;
        
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        // 游戏结束文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            '游戏结束',
            this.gameCanvas.width / 2,
            this.gameCanvas.height / 2
        );
    }

    // 渲染暂停画面
    renderPaused() {
        const ctx = this.gameCtx;
        
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        // 暂停文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            '已暂停',
            this.gameCanvas.width / 2,
            this.gameCanvas.height / 2
        );
    }
}