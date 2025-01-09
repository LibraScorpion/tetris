class Tetromino {
    // 定义所有方块形状
    static SHAPES = {
        I: [
            [[0,0,0,0],
             [1,1,1,1],
             [0,0,0,0],
             [0,0,0,0]],
        ],
        J: [
            [[1,0,0],
             [1,1,1],
             [0,0,0]],
        ],
        L: [
            [[0,0,1],
             [1,1,1],
             [0,0,0]],
        ],
        O: [
            [[1,1],
             [1,1]],
        ],
        S: [
            [[0,1,1],
             [1,1,0],
             [0,0,0]],
        ],
        T: [
            [[0,1,0],
             [1,1,1],
             [0,0,0]],
        ],
        Z: [
            [[1,1,0],
             [0,1,1],
             [0,0,0]],
        ]
    };

    // 定义方块颜色
    static COLORS = {
        I: '#00f0f0',
        J: '#0000f0',
        L: '#f0a000',
        O: '#f0f000',
        S: '#00f000',
        T: '#a000f0',
        Z: '#f00000'
    };

    constructor(type = this.randomType()) {
        this.type = type;
        this.shape = JSON.parse(JSON.stringify(Tetromino.SHAPES[type][0]));
        this.color = Tetromino.COLORS[type];
        this.x = 3;
        this.y = 0;
        this.rotation = 0;
    }

    // 生成随机方块类型
    randomType() {
        const types = Object.keys(Tetromino.SHAPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    // 获取当前方块的所有格子位置
    getCells() {
        const cells = [];
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    cells.push({
                        x: this.x + col,
                        y: this.y + row
                    });
                }
            }
        }
        return cells;
    }

    // 移动方块
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    // 旋转方块
    rotate() {
        if (this.type === 'O') return; // O型方块不需要旋转

        const N = this.shape.length;
        const rotated = Array.from({length: N}, () => Array(N).fill(0));
        
        // 矩阵转置
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                rotated[i][j] = this.shape[N - 1 - j][i];
            }
        }
        
        this.shape = rotated;
        this.rotation = (this.rotation + 1) % 4;
    }

    // 克隆当前方块
    clone() {
        const clone = new Tetromino(this.type);
        clone.shape = JSON.parse(JSON.stringify(this.shape));
        clone.x = this.x;
        clone.y = this.y;
        clone.rotation = this.rotation;
        return clone;
    }

    // 获取方块的边界框
    getBoundingBox() {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        this.getCells().forEach(cell => {
            minX = Math.min(minX, cell.x);
            minY = Math.min(minY, cell.y);
            maxX = Math.max(maxX, cell.x);
            maxY = Math.max(maxY, cell.y);
        });

        return {
            left: minX,
            top: minY,
            right: maxX,
            bottom: maxY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }
}