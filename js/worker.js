"use strict"

function work() {
    function* range(start, end, step) {
        yield start;
        while (end > start) {
            start += step;
            yield start;
        }
    }

    class NumericalIntegral {

        constructor(a, b, strFn, vars, options) {
            if (this.constructor == NumericalIntegral) {
                throw new Error("Объект абстрактного класса не может быть создан");
            }
            this.a = typeof a === 'number' ? [a] : a;
            this.b = typeof b === 'number' ? [b] : b;
            this.strFn = strFn;
            this.fn = this._strToFn(vars);
            this.dim = vars.length;
            this.options = options;
            this.S = undefined;
            const x = Array.from(range(this.a[0], this.b[0], Math.abs(this.a[0] - this.b[0]) / 2000));
            this.history = {};
            this.origPoints = { x, y: x.map((x_i) => this.fn(x_i)) };
        }

        integrate() {
            if (typeof this.S !== 'undefined') {
                return this;
            }
            const { eps, step } = this.options;
            let { x: stepByX } = step;
            stepByX *= 2;
            let sOld = Infinity,
                sNew = 0,
                attempt = 0;
            const start = performance.now();
            if (this.dim == 1) {
                while (true) {
                    if (Math.abs(sOld - sNew) < eps) {
                        break;
                    } else {
                        ++attempt;
                        sOld = sNew;
                        sNew = 0;
                        stepByX /= 2;
                    }
                    for (const x of this._range(stepByX, 0)) {
                        const sChunk = this._int1D(x, stepByX);
                        if (!isNaN(sChunk)) {
                            sNew += sChunk;
                        }
                    }
                }
            } else {
                throw new Error('Многомерные случаи не реализованы');
            }
            const end = performance.now();
            this.history = { endStep: stepByX, attempt, S: sNew, perf: end - start, a: this.a, b: this.b };
            this.S = sNew;
            return this;
        }

        _int1D(x, stepByX) {
            throw new Error("Метод '_int1D(x, stepByX)' не реализован");
        }

        _range(step, axis) {
            return range(this.a[axis], this.b[axis], step);
        }

        _strToFn(vars) {
            const fn = new Function(...vars, 'with (Math) return ' + this.strFn);
            return fn;
        }
    }

    class Trapezoidal extends NumericalIntegral {

        _range(step, axis) {
            return range(this.a[axis], this.b[axis] - step, step);
        }

        _int1D(x, stepByX) {
            return stepByX * (this.fn(x) + this.fn(x + stepByX)) / 2;
        }

    }

    class Simpson extends NumericalIntegral {

        _range(step, axis) {
            return range(this.a[axis] + step / 2, this.b[axis] - step / 2, step);
        }


        _int1D(x, stepByX) {
            return stepByX / 6 * (this.fn(x - stepByX / 2) + 4 * this.fn(x) + this.fn(x + stepByX / 2));
        }

    }

    class GaussLegendre extends NumericalIntegral {

        constructor(...args) {
            super(...args);
            switch (this.options.polynom) {
                case 1:
                    {
                        this.Legendre = { points: [0], weights: [2] };
                        break;
                    }
                case 2:
                    {
                        this.Legendre = { points: [1 / Math.sqrt(3), -1 / Math.sqrt(3)], weights: [1, 1] };
                        break;
                    }
                case 3:
                    {
                        this.Legendre = { points: [0, Math.sqrt(3 / 5), -Math.sqrt(3 / 5)], weights: [8 / 9, 5 / 9, 5 / 9] };
                        break;
                    }
                case 4:
                    {
                        this.Legendre = {
                            points: [Math.sqrt(3 / 7 - 2 / 7 * Math.sqrt(6 / 5)), -Math.sqrt(3 / 7 - 2 / 7 * Math.sqrt(6 / 5)),
                                Math.sqrt(3 / 7 + 2 / 7 * Math.sqrt(6 / 5)), -Math.sqrt(3 / 7 + 2 / 7 * Math.sqrt(6 / 5))
                            ],
                            weights: [(18 + Math.sqrt(30)) / 36, (18 + Math.sqrt(30)) / 36, (18 - Math.sqrt(30)) / 36, (18 - Math.sqrt(30)) / 36]
                        };
                        break;
                    }
                case 5:
                    {
                        this.Legendre = {
                            points: [0, 1 / 3 * Math.sqrt(5 - 2 * Math.sqrt(10 / 7)), -1 / 3 * Math.sqrt(5 - 2 * Math.sqrt(10 / 7)),
                                1 / 3 * Math.sqrt(5 + 2 * Math.sqrt(10 / 7)), -1 / 3 * Math.sqrt(5 + 2 * Math.sqrt(10 / 7))
                            ],
                            weights: [128 / 225, (322 + 13 * Math.sqrt(70)) / 900, (322 + 13 * Math.sqrt(70)) / 900,
                                (322 - 13 * Math.sqrt(70)) / 900, (322 - 13 * Math.sqrt(70)) / 900
                            ]
                        };
                        break;
                    }
                default:
                    {
                        this.Legendre = { points: [0, Math.sqrt(3 / 5), -Math.sqrt(3 / 5)], weights: [8 / 9, 5 / 9, 5 / 9] };
                        this.options.polynom = 3;
                        break;
                    }
            }
        }

        _range(step, axis) {
            return range(this.a[axis], this.b[axis] - step, step);
        }

        _int1D(x, stepByX) {
            const [a, b] = [x, x + stepByX];
            let sum = 0;
            for (let i = 0; i != this.options.polynom; i++) {
                sum += this.Legendre.weights[i] * this.fn((b - a) / 2 * this.Legendre.points[i] + (b + a) / 2);
            }
            const mult = (b - a) / 2;
            return mult * sum;
        }

    }

    const Methods = { 'trapezoidal': Trapezoidal, 'Simpson': Simpson, 'Gauss': GaussLegendre };

    onmessage = (e) => {
        const { data } = e;
        switch (data.status) {
            case 'init':
                {
                    try {
                        const { a: limsA, b: limsB, eps, step, fns: Allfns, method: strMethod, polynom } = data;
                        const method = Methods[strMethod];
                        let totalS = 0;
                        for (let i = 0; i != limsA.length; i++) {
                            const fns = Allfns[i];
                            const [a, b] = [limsA[i], limsB[i]];
                            const allFn = [];
                            for (const [j, fn] of fns.entries()) {
                                if (!fn) {
                                    continue;
                                }
                                const m = new method(+a.replace(',', '.', 1), +b.replace(',', '.', 1), fn, ['x'], {
                                    eps: +eps.replace(',', '.', 1),
                                    step: { x: +step.x.replace(',', '.', 1) },
                                    polynom: polynom ? +polynom : undefined
                                });
                                postMessage({ status: 'plotFn', points: m.origPoints, fn: m.strFn, isY0: j == 1 });
                                m.integrate();
                                postMessage({ status: 'history', history: {...m.history, fn: m.strFn } });
                                allFn.push(m);
                            }
                            totalS += allFn.slice(1).reduce((prev, { S: curr }) => prev - curr, allFn[0].S);
                        }
                        postMessage({ status: 'end', totalS });
                        break;
                    } catch (e) {
                        postMessage({ status: 'error', error: e })
                    }
                }
        }
    };
}

if (window != self) {
    work();
}