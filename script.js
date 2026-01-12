(() => {
    const display = document.getElementById("display");
    const historyEl = document.getElementById("history");
    const keys = document.querySelector(".keys");

    let current = "0";
    let prev = null;
    let op = null;
    let justEvaluated = false;

    const MAX_LEN = 16;

    const fmt = (str) => {
        if (str.length <= MAX_LEN) return str;
        const n = Number(str);
        if (!Number.isFinite(n)) return "Error";
        return n.toExponential(6);
    };

    const setDisplay = (val) => {
        display.textContent = fmt(val);
    };

    const setHistory = () => {
        if (prev === null || op === null) {
            historyEl.textContent = "";
            return;
        }
        historyEl.textContent = `${prev} ${op}`;
    };

    const compute = (a, operator, b) => {
        if (operator === "+") return a + b;
        if (operator === "-") return a - b;
        if (operator === "*") return a * b;
        if (operator === "/") return b === 0 ? NaN : a / b;
        return b;
    };

    const clearAll = () => {
        current = "0";
        prev = null;
        op = null;
        justEvaluated = false;
        setHistory();
        setDisplay(current);
    };

    const backspace = () => {
        if (justEvaluated) return;
        if (current.length <= 1) current = "0";
        else current = current.slice(0, -1);
        setDisplay(current);
    };

    const inputDigit = (d) => {
        if (justEvaluated) {
            current = "0";
            justEvaluated = false;
        }
        if (current === "0") current = d;
        else current += d;
        setDisplay(current);
    };

    const inputDot = () => {
        if (justEvaluated) {
            current = "0";
            justEvaluated = false;
        }
        if (!current.includes(".")) {
            current += ".";
            setDisplay(current);
        }
    };

    // ✅ Percent:
    // If no operator => current/100
    // If operator exists => base * (current/100)
    // Example: 200 + 10% => 200 + 20
    const percent = () => {
        const cur = Number(current);
        if (!Number.isFinite(cur)) return;

        if (prev === null || op === null) {
            current = String(cur / 100);
            setDisplay(current);
            return;
        }

        const base = Number(prev);
        if (!Number.isFinite(base)) return;

        current = String(base * (cur / 100));
        setDisplay(current);
    };

    const chooseOp = (nextOp) => {
        if (current === "Error") return;

        // chain operations
        if (op && prev !== null && !justEvaluated) {
            const result = compute(Number(prev), op, Number(current));
            if (!Number.isFinite(result)) {
                current = "Error";
                prev = null;
                op = null;
                setHistory();
                setDisplay(current);
                return;
            }
            prev = String(result);
            current = "0";
            op = nextOp;
            setHistory();
            setDisplay(prev);
            return;
        }

        if (prev === null) prev = current;
        op = nextOp;
        current = "0";
        justEvaluated = false;
        setHistory();
        setDisplay(prev);
    };

    const equals = () => {
        if (prev === null || op === null) return;

        const a = Number(prev);
        const b = Number(current);
        const result = compute(a, op, b);

        if (!Number.isFinite(result)) {
            current = "Error";
            prev = null;
            op = null;
            justEvaluated = true;
            setHistory();
            setDisplay(current);
            return;
        }

        historyEl.textContent = `${prev} ${op} ${current} =`;
        current = String(result);
        prev = null;
        op = null;
        justEvaluated = true;
        setDisplay(current);
    };

    // Click
    keys.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const num = btn.dataset.num;
        const action = btn.dataset.action;
        const operator = btn.dataset.op;

        if (num !== undefined) return inputDigit(num);
        if (operator) return chooseOp(operator);

        if (action === "clear") return clearAll();
        if (action === "back") return backspace();
        if (action === "dot") return inputDot();
        if (action === "percent") return percent();
        if (action === "equals") return equals();
    });

    // Keyboard
    window.addEventListener("keydown", (e) => {
        const k = e.key;

        if (k >= "0" && k <= "9") return inputDigit(k);
        if (k === ".") return inputDot();
        if (k === "+" || k === "-" || k === "*" || k === "/") return chooseOp(k);

        if (k === "Enter" || k === "=") {
            e.preventDefault();
            return equals();
        }

        if (k === "Backspace") return backspace();
        if (k === "Escape") return clearAll();
        if (k === "%") return percent();
    });

    clearAll();
})();
