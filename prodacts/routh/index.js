function tryCalculation() {
    try {
        calculation();
    }
    catch(e) {
        alert("入力が適切ではありません")
        console.log(e);
    }
}

function calculation() {
    // 入力の取得
    const input = document.inputForm.coefficient.value;
    if(input === "") return;

    // 入力を空白で分割
    const splitInput = input.split(" ");
    // 入力が全て整数値であるかの判別
    const allInteger = splitInput.every(isInteger);
    if(!allInteger) return;

    // 入力を整数に直す
    let coefficients = [];
    for(let i = 0; i < splitInput.length; i++) {
        coefficients.push(parseInt(splitInput[i]));
    }

    // 表の初期値への書き込み
    const coefficientNum = coefficients.length;
    const width = Math.ceil(coefficientNum / 2);
    let table = [];
    table.push(new Array(width).fill(0));
    table.push(new Array(width).fill(0));
    for(let i = 0; i <coefficientNum; i++) {
        table[i % 2][Math.floor(i / 2)] = coefficients[i];
    }

    // ラウス数列の計算
    let nowRow = 1;
    while(true) {
        if(table[nowRow][0] === 0) break;
        let tmp = new Array(width).fill(0);
        for(let i = 0; i < width - 1; i++) {
            tmp[i] = table[nowRow - 1][i + 1] - table[nowRow - 1][0] * table[nowRow][i + 1] / table[nowRow][0];
        }
        table.push(tmp);
        if(table.every(element => element === 0)) break;
        nowRow++;
    }

    // 表の描画
    const content = document.getElementById("content");
    content.innerHTML = "";

    const height = table.length;

    for(let i = 0; i < height; i++) {
        let tbody = document.createElement("tbody");
        let row = document.createElement("tr");
        for(let j = 0; j < width; j++) {
            let col = document.createElement("td");
            col.scope = "col";
            col.innerHTML = table[i][j];
            row.appendChild(col);
        }
        if(i % 2 === 0) row.classList.add("table-secondary");
        tbody.appendChild(row);
        content.appendChild(tbody);
    }

    // 安定、不安定の判別
    const discrimination = document.getElementById("discrimination");
    discrimination.innerHTML = "";
    // 符号が変わった回数を数える
    let count = 0;
    for(let i = 0; i < height - 2; i++) {
        if((table[i][0] < 0 && table[i + 1][0] > 0) || table[i][0] > 0 && table[i + 1][0] < 0) count++;
    }
    // テキストの挿入
    let p = document.createElement("p");
    p.innerHTML = "符号が変わる回数は" + count + "回";
    discrimination.appendChild(p);
    p = document.createElement("p");
    if(count > 0) p.innerHTML = "よって不安定";
    else p.innerHTML = "よって安定";
    discrimination.appendChild(p);
}

function isInteger(maybeNumber) {
    const pattern = /^[+,-]?([1-9]\d*|0)$/;
    return pattern.test(maybeNumber);
}