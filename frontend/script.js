const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");

const convertButton = document.getElementById("convertButton");
const swapButton = document.getElementById("swapButton");

const resultDiv = document.getElementById("result");
const historyDiv = document.getElementById("history");


// Convert Currency
convertButton.addEventListener("click", async () => {

    const amount = Number(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (!amount || amount <= 0) {
        resultDiv.textContent = "Please enter a valid amount.";
        return;
    }

    resultDiv.textContent = "Converting...";

    try {

        const response = await fetch(
            `http://localhost:5000/api/convert?amount=${amount}&from=${from}&to=${to}`
        );

        const data = await response.json();

        if (!response.ok) {
            resultDiv.textContent = "Conversion failed.";
            return;
        }

        resultDiv.textContent =
            `${data.amount} ${data.from} = ${data.result} ${data.to}`;

        loadHistory();

    } catch (error) {

        console.log(error);

        resultDiv.textContent =
            "Could not connect to backend.";

    }
});


// Swap currencies
swapButton.addEventListener("click", () => {

    const temp = fromCurrency.value;

    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

});


// Load conversion history
async function loadHistory() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/history"
        );

        const history = await response.json();

        historyDiv.innerHTML = "";

        if (history.length === 0) {

            historyDiv.innerHTML =
                '<p class="empty-message">No conversion history yet.</p>';

            return;
        }

        history.forEach(item => {

            const div = document.createElement("div");

            div.className = "history-item";

            div.textContent =
                `${item.amount} ${item.from_currency} → ${item.result} ${item.to_currency}`;

            historyDiv.appendChild(div);

        });

    } catch (error) {

        console.log(error);

        historyDiv.innerHTML =
            '<p class="empty-message">Could not load history.</p>';

    }
}


// Load history when page opens
loadHistory();