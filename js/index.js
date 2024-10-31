'use strict'

const consoleOutput = document.getElementById('consoleOutput');
const worker = new Worker(URL.createObjectURL(new Blob([`(${work.toString()})()`], { type: 'text/javascript' })));
const calculate = document.getElementById('calculate');
let totalTime = 0;

worker.onmessage = (e) => {
    const { data } = e;
    switch (data.status) {
        case 'history':
            {
                const { history } = data;
                totalTime += history.perf;
                consoleOutput.value += `Вычислен y(x) = ${history.fn} за ${history.perf.toFixed(3)} мс. на x ∊ [${history.a}, ${history.b}]\nКоличество итераций: ${history.attempt}, шаг по x: ${history.endStep}\nЗначение интеграла ${history.S.toFixed(6)}\n`;
                break;
            }
        case 'plotFn':
            {
                const length = plotDiv.data.length;
                if (!data.isY0) {
                    plotDiv.data.push({...data.points, name: 'y(x) = ' + data.fn, fill: 'tozeroy', fillcolor: "#00000044" });
                } else {
                    if (data.fn != '0') {
                        plotDiv.data[length - 1].fill = undefined;
                        plotDiv.data.push({...data.points, name: 'y0(x) = ' + data.fn, fill: 'tonexty', fillcolor: '#00000044' });
                    }
                }
                Plotly.redraw(plotDiv);
                break;
            }
        case 'end':
            {
                consoleOutput.value += `---\nИтоговое значение интеграла: ${data.totalS}\nВычислено за: ${totalTime.toFixed(4)} мс.\n`;
                calculate.disabled = false;
                break;
            }
        case 'error':
            {
                consoleOutput.value += `Произошла ошибка: ${data.error}`;
                calculate.disabled = false;
                break;
            }
    }
};

const ruMethods = {
    'trapezoidal': 'трапеций',
    'Simpson': 'Симпсона',
    'Gauss': 'Гаусса-Лежандра'
};

function calc(target) {
    const {
        a: { value: a },
        b: { value: b },
        eps: { value: eps },
        step: { value: step },
        functions,
        method: { value: method },
        polynom: { value: polynom },
        limFunctions,
    } = target;
    plotDiv.data = [];
    Plotly.redraw(plotDiv);
    totalTime = 0;
    const limsA = [],
        limsB = [],
        fns = [];
    for (let i = 0; i !== limFunctions.length; i += 2) {
        const [{ value: fn }, { value: y0 }, { value: minX }, { value: maxX }] = [functions[i], functions[i + 1], limFunctions[i], limFunctions[i + 1]];
        if (!fn && !minX && !maxX) {
            continue;
        }
        fns.push([fn.replace("X", 'x').replace('Ч', 'x').replace('ч', 'x'), y0 && y0 != 0 ? y0.replace("X", 'x').replace('Ч', 'x').replace('ч', 'x') : undefined]);
        limsA.push(minX);
        limsB.push(maxX);
    }
    consoleOutput.value = 'Запуск: ' + new Date().toLocaleString() + '\n';
    if (!fns.length) {
        return;
    }
    let out = `Начальный шаг: ${step}\nПределы интегрирования от ${a} до ${b}\n${method != 'Gauss' ? `Метод ${ruMethods[method]}` : `Метод ${ruMethods[method]}, порядок полинома Лежандра ${polynom}`}\n`;
    for (const [i, fns_i] of fns.entries()) {
        const haveY0 = fns_i[1]; 
        if (haveY0) {
            out += `Интегрируемая функция y(x) = ${fns_i[0]} и y0(x) = ${fns_i[1]}\n`;
        } else {
            out += `Интегрируемая функция y(x) = ${fns_i[0]}\n`;
        }
        out += `Кусочно задан${haveY0 ? 'ы' : 'а'} на x ∊ [${limsA[i]}, ${limsB[i]}]\n`;
    }
    consoleOutput.value += out;
    worker.postMessage({ status: 'init', a: limsA, b: limsB, eps, step: { x: step }, fns, method, polynom });
    calculate.disabled = true;
}