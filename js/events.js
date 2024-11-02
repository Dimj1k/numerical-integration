'use strict'

const allFunctions = document.getElementById("all_functions");

function methodSelect(event) {
    event.preventDefault();
    const { key, target } = event;
    if (key) {
        if (key == 'ArrowLeft') {
            const prev = target.previousElementSibling.previousElementSibling;
            if (prev) {
                prev.focus();
                prev.click();
            }
        }
        if (key == 'ArrowRight') {
            const nextSibling = target.nextElementSibling;
            if (nextSibling) {
                const next = nextSibling.nextElementSibling;
                if (next) {
                    next.focus();
                    next.click();
                }
            }
        }
        if (key == ' ' || key == 'Enter') {
            target.click();
        }
        return;
    }
}
let idFn = 2;

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
<span class="panel__span">Кусочно-заданная функция ${idFn} y(x)</span>
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
    for (const child of allFunctions.children) {
        if (child.key == id) {
            return allFunctions.removeChild(child);
        }
    }
}