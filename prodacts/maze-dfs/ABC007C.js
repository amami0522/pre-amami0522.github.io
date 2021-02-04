function showGrid() {
    try {
        show();
    }
    catch(e) {
        alert(e);
    }
}

let isRunning = false;

function show() {
    if(isRunning) return;
    isRunning = true;
    const height = parseInt(document.gridSize.inputHeight.value);  // 高さ
    const width = parseInt(document.gridSize.inputWidth.value);  // 幅
    const startY = 1;  // スタートのY座標
    const startX = 1;  // スタートのX座標
    const endY = height - 2;  // ゴールのY座標
    const endX = width - 2;  // ゴールのX座標

    let gridSize = "";
    if(height * width <= 400) gridSize = "td-small";
    else if(height * width <= 1300) gridSize = "td-middle";
    else gridSize = "td-large";

    // 表示エリアの初期化
    const content = document.getElementById("content");
    content.innerHTML = "";

    // 壁を作る候補
    let candidate = [];

    // 既に壁になった座標
    let wall = [];

    // 迷路の生成
    let grid = [];
    for(let i = 0; i < height; i++) {
        const tmp = new Array(width);
        grid.push(tmp);
    }
    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            // 座標が共に偶数の場合壁候補とする
            if(i % 2 === 0 && j % 2 === 0) candidate.push(new pair(i, j));

            // 外枠は壁とする
            if(i === 0 || i === height - 1 || j === 0 || j === width - 1) {
                grid[i][j] = "#";
                wall.push(new pair(i, j));
            }
            else grid[i][j] = ".";
        }
    }

    // 差分用の変数
    const dy = [-1, 0, 0, 1];
    const dx = [0, -1, 1, 0];
    const dy2 = [-2, 0, 0, 2];
    const dx2 = [0, -2, 2, 0];

    // 探索予定地が空になるまで探索
    while(!candidate.length == 0) {
        // ランダムに開始地点を選ぶ
        candidate =  shuffle(candidate);
        // 壁作成の開始地点を(y, x)にする
        let y = candidate[0].first;
        let x = candidate[0].second;

        // 既に壁ならスルー
        if(grid[y][x] === "#") {
            candidate.shift();
            continue;
        }

        // 壁の作成開始地点を壁にする
        grid[y][x] = "#";
        wall.push(new pair(y, x));

        // 探索中に作った壁をメモする配列
        let stack = [];
        stack.push(new pair(y, x));

        // 壁を伸ばせる間伸ばす
        while(stack.length !== 0) {
            // 移動可能な方向
            let direction = [];

            let nowY = stack[stack.length - 1].first;
            let nowX = stack[stack.length - 1].second;

            // 4方向のうち進むことが出来る方向を列挙する
            for(let i = 0; i < 4; i++) {
                const ny = nowY + dy2[i];
                const nx = nowX + dx2[i];
                if(ny < 0 || ny >= height || nx < 0 || nx >= width) continue;

                // 現在伸ばし中の壁に当たらないかどうか
                let frag = true;
                for(let j = 0; j < stack.length; j++) {
                    if(ny === stack[j].first && nx === stack[j].second) frag = false;
                }
                // 行ける方向の候補として追加する
                if(grid[ny][nx] === ".") direction.push(i);
                else if(frag) direction.push(i);
            }

            // 進める方向が無ければ終了
            if(direction.length == 0) {
                stack.pop();
                continue;
            }

            // 進むことが出来る方向の中からランダムで進む
            direction = shuffle(direction);

            // 進行方向を更新する
            const nextY1 = nowY + dy[direction[0]];
            const nextX1 = nowX + dx[direction[0]];
            const nextY2 = nowY + dy2[direction[0]];
            const nextX2 = nowX + dx2[direction[0]];
            grid[nextY1][nextX1] = "#";
            wall.push(new pair(nextY1, nextX1));

            // 進む先が既存の壁なら探索終了
            if(grid[nextY2][nextX2] == "#") break;
            // そうでなければ探索を続ける
            grid[nextY2][nextX2] = "#";
            stack.push(new pair(nextY2, nextX2));
            wall.push(new pair(nextY2, nextX2));
            nowY = nextY2;
            nowX = nextX2;
        }
        candidate.shift();
    }

    // グリッドの表示
    for(let i = 0; i < height; i++) {
        let row = document.createElement("tr");
        for(let j = 0; j < width; j++) {
            let col = document.createElement("td");
            col.classList.add(gridSize);
            if(i === startY && j === startX) col.classList.add("red");
            else if(i === endY && j === endX) col.classList.add("blue");
            // else if(grid[i][j] === "#") col.classList.add("black");
            else col.classList.add("white");
            col.id = "grid" + (String)(width * i + j);
            row.appendChild(col);
        }
        content.appendChild(row);
    }

    // キューに追加された順番
    let order = [];
    order.push(new pair(startY, startX));

    // (y, x)までの手数
    let ans = [];
    for(let i = 0; i < height; i++) {
        const tmp = new Array(width).fill(-1);
        ans.push(tmp);
    }
    ans[startY][startX] = 0;

    // どの方向から来たのかを保持する配列
    let pre = [];
    for(let i = 0; i < height; i++) {
        const tmp = new Array(width).fill(new pair(0, 0));
        pre.push(tmp);
    }

    // 幅優先探索
    let queue = [];
    queue.push(new pair(startY, startX));
    ans[startY][startX] = 0;

    while(queue.length !== 0) {
        const y = queue[0].first;
        const x = queue[0].second;
        queue.shift();
        for(let i = 0; i < 4; i++) {
            const ny = y + dy[i];
            const nx = x + dx[i];
            if(ny < 0 || ny >= height || nx < 0 || nx >= width || grid[ny][nx] === "#" || ans[ny][nx] !== -1) continue;
            ans[ny][nx] = ans[y][x] + 1;
            pre[ny][nx] = new pair(-1 * dy[i], -1 * dx[i]);
            queue.push(new pair(ny, nx));
            order.push(new pair(ny, nx));
        }
    }

    // 迷路生成の描画
    const wallNum = wall.length;
    wallDraw();
    function wallDraw() {
        if(wall.length === 0) {
            draw();
            return;
        }
        const y = wall[0].first;
        const x = wall[0].second;
        const cell = document.getElementById("grid" + (width * y + x));
        cell.className = "";
        cell.classList.add("black")
        cell.classList.add(gridSize);
        wall.shift();
        setTimeout(function() {
            wallDraw();
        }, 5000 / wallNum);
    }

    // 幅優先探索の描画
    const num = order.length;
    function draw() {
        if(order.length === 0) {
            drawPath();
            return;
        }
        const y = order[0].first;
        const x = order[0].second;
        const cell = document.getElementById("grid" + (width * y + x));
        if(!(y === startY && x === startX || y === endY && x === endX)) cell.className = "orenge";
        cell.innerHTML = ans[y][x];
        order.shift();
        setTimeout(function() {
            draw();
        }, 10000 / num);
    }

    // パスを求める
    let revPath = [];
    let nowY = endY;
    let nowX = endX;
    while(true) {
        const ny = nowY + pre[nowY][nowX].first;
        const nx = nowX + pre[nowY][nowX].second;
        if(pre[nowY][nowX].first === 0 && pre[nowY][nowX].second === 0) break;
        if(ny === startY && nx === startX) break;
        revPath.push(new pair(ny, nx));
        nowY = ny;
        nowX = nx;
    }

    // パスの描画
    // drawPath();
    const dist = revPath.length;
    function drawPath() {
        if(revPath.length === 0) {
            isRunning = false;
            return;
        }
        const y = revPath[0].first;
        const x = revPath[0].second;
        const cell = document.getElementById("grid" + (width * y + x));
        cell.className = "lightgreen";
        revPath.shift();
        setTimeout(function() {
            drawPath();
        }, 1000 / dist);
    }
}

function pair(first, second) {
    this.first = first;
    this.second = second;
}

const shuffle = ([...array]) => {
    for(let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] =[array[j], array[i]];
    }
    return array;
}