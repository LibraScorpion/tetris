class Board {
    constructor(width = 10, height = 20) {
        this.width = width;
        this.height = height;
        this.reset();
    }

    // 重置游戏板
    reset() {
        this.grid = Array.from({length: this.height}, () => 
            Array(this.width).fill(null)
        );
        this.currentPiece = null;
        this.nextPiece = new Tetromino();
    }

    // 生成新方块
    spawn() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = new Tetromino();
        
        // 检查游戏是否结束
        if (this.isCollision(this.currentPiece)) {
            return false;
        }
        return true;
    }

    // 检查碰撞
    isCollision(piece) {
        return piece.getCells().some(cell => {
            // 检查边界
            if (cell.x < 0 || cell.x >= this.width || cell.y >= this.height) {
                return true;
            }
            // 检查与其他方块的碰撞
            if (cell.y >= 0 && this.grid[cell.y][cell.x] !== null) {
                return true;
            }
            return false;
        });
    }

    // 锁定当前方块
    lockPiece() {
        this.currentPiece.getCells().forEach(cell => {
            if (cell.y >= 0) {
                this.grid[cell.y][cell.x] = {
                    color: this.currentPiece.color
                };
            }
        });
    }

    // 移动当前方块
    movePiece(dx, dy) {
        const piece = this.currentPiece;
        piece.move(dx, dy);
        
        if (this.isCollision(piece)) {
            piece.move(-dx, -dy);
            return false;
        }
        return true;
    }

    // 旋转当前方块
    rotatePiece() {
        const piece = this.currentPiece;
        const originalShape = JSON.parse(JSON.stringify(piece.shape));
        const originalRotation = piece.rotation;
        
        piece.rotate();
        
        // 如果旋转后发生碰撞，尝试左右移动来适应旋转
        if (this.isCollision(piece)) {
            // 尝试向左移动
            piece.move(-1, 0);
            if (this.isCollision(piece)) {
                piece.move(2, 0); // 尝试向右移动
                if (this.isCollision(piece)) {
                    // 如果都不行，恢复原状
                    piece.move(-1, 0);
                    piece.shape = originalShape;
                    piece.rotation = originalRotation;
                    return false;
                }
            }
        }
        return true;
    }

    // 检查并清除已完成的行
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.height - 1; row >= 0; row--) {
            if (this.grid[row].every(cell => cell !== null)) {
                // 删除该行
                this.grid.splice(row, 1);
                // 在顶部添加新行
                this.grid.unshift(Array(this.width).fill(null));
                linesCleared++;
                row++; // 重新检查当前行，因为上面的行下移了
            }
        }
        
        return linesCleared;
    }

    // 获取投影位置
    getGhostPiecePosition() {
        if (!this.currentPiece) return null;
        
        const ghost = this.currentPiece.clone();
        while (!this.isCollision(ghost)) {
            ghost.move(0, 1);
        }
        ghost.move(0, -1);
        return ghost;
    }

    // 快速下落
    hardDrop() {
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        return dropDistance;
    }

    // 获取整个游戏板的状态
    getState() {
        // 创建游戏板快照
        const snapshot = this.grid.map(row => [...row]);
        
        // 添加当前方块到快照
        if (this.currentPiece) {
            this.currentPiece.getCells().forEach(cell => {
                if (cell.y >= 0 && cell.y < this.height && cell.x >= 0 && cell.x < this.width) {
                    snapshot[cell.y][cell.x] = {
                        color: this.currentPiece.color
                    };
                }
            });
        }
        
        // 添加投影方块
        const ghost = this.getGhostPiecePosition();
        if (ghost) {
            ghost.getCells().forEach(cell => {
                if (cell.y >= 0 && cell.y < this.height && cell.x >= 0 && cell.x < this.width) {
                    if (snapshot[cell.y][cell.x] === null) {
                        snapshot[cell.y][cell.x] = {
                            color: ghost.color + '40' // 添加透明度
                        };
                    }
                }
            });
        }
        
        return snapshot;
    }
}