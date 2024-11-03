'use strict'

const allFunctions = document.getElementById("all_functions");
const methods = document.getElementById('methods').children;

function methodSelect(event) {
    event.preventDefault();
    const { key, target } = event;
    if (key) {
        if (key == 'ArrowLeft') {
            const spanRadio = target.previousElementSibling.previousElementSibling;
            if (spanRadio) {
                target.tabIndex = -1;
                target.ariaChecked = false;
                const radio = spanRadio.previousElementSibling;
                if (radio) {
                    spanRadio.focus();
                    spanRadio.tabIndex = 0;
                    spanRadio.ariaChecked = true;
                    radio.checked = true;
                }
            }
        } else if (key == 'ArrowRight') {
            const radio = target.nextElementSibling;
            if (radio) {
                target.tabIndex = -1;
                target.ariaChecked = false;
                const spanRadio = radio.nextElementSibling;
                if (spanRadio) {
                    spanRadio.focus();
                    spanRadio.tabIndex = 0;
                    spanRadio.ariaChecked = true;
                    radio.checked = true;
                }
            }
        }
        return;
    }
    for (const method of methods) {
        if (method === target) {
            method.focus();
            method.tabIndex = 0;
            method.ariaChecked = true;
            const radio = method.previousElementSibling;
            radio.checked = true;
        } else {
            method.ariaChecked = false;
            method.tabIndex = -1;
        }
    }
}
for (const method of methods) {
    if (method instanceof HTMLInputElement && method.type == 'radio') {
        const spanRadio = method.nextElementSibling;
        spanRadio.tabIndex = method.checked ? 0 : -1;
    }
}

let idFn = 2;
let numFn = 2;

function addNewFunction(event) {
    event.preventDefault();
    const { key } = event;
    if (key) {
        if (key == ' ' || key == 'Enter') {
            const fnDiv = addDivFunction();
            fnDiv.querySelector('input').focus();
        }
        return;
    }
    addDivFunction();
}

function addDivFunction() {
    const fnDiv = document.createElement('div');
    fnDiv.className = "panel__input__function";
    fnDiv.key = idFn;
    fnDiv.innerHTML = `<div class="panel__max__inputs">
<div class="vertical-label">
<label for="f${idFn}">
<span class="panel__span">Кусочно-заданная функция ${numFn++} y(x)</span>
</label>
<input id="f${idFn}" name="functions">
</div>
<div class="vertical-label">
<label for="y0${idFn}">
<span class="panel__span">y0(x)</span>
</label>
<input id="y0${idFn}" name="functions" placeholder="0" value="0">
</div>
</div>
<div class="panel__min__inputs">
<div class="vertical-label"><label for="f${idFn}a"><span class="panel__span">Начало x</span></label><input name="limFunctions" type="tel" id="f${idFn}a"></div>
<div class="vertical-label"><label for="f${idFn}b"><span class="panel__span">Конец x</span></label><input name="limFunctions" type="tel" id="f${idFn}b"></div>
</div>
<button class="panel__button" onkeyup="deleteFunction(event, ${idFn});" onclick="deleteFunction(event, ${idFn});"><span class="vrl">Удалить</span></button>
</div>`;
    idFn++;
    allFunctions.appendChild(fnDiv);
    return fnDiv;
}

function deleteFunction(event, id) {
    event.preventDefault();
    const { key, target } = event;
    if (key) {
        if (key == ' ' || key == 'Enter') {
            return target.click();
        }
        return;
    }
    numFn--;
    let i = 1;
    const childrens = Array.from(allFunctions.children);
    for (const child of childrens) {
        if (child.key == id) {
            allFunctions.removeChild(child);
        } else {
            child.querySelector('label').children[0].textContent = `Кусочно-заданная функция ${i++} y(x)`;
        }
    }
}