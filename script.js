/* ==========================================
   EXPENSE & BUDGET VISUALIZER
   PART 1
========================================== */

// ===============================
// ELEMENT
// ===============================

const form = document.getElementById("expenseForm");
const itemName = document.getElementById("itemName");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const customCategory = document.getElementById("customCategory");
const customCategoryGroup = document.getElementById("customCategoryGroup");

const transactionList = document.getElementById("transactionList");
const totalBalance = document.getElementById("totalBalance");

const sortSelect = document.getElementById("sortSelect");
const themeToggle = document.getElementById("themeToggle");

// ===============================
// DATA
// ===============================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let expenseChart = null;

// ===============================
// FORMAT RUPIAH
// ===============================

function formatRupiah(number){

    return "Rp " + Number(number).toLocaleString("id-ID");

}

// ===============================
// SHOW MESSAGE
// ===============================

function showMessage(text,type="success"){

    let message=document.querySelector(".message");

    if(!message){

        message=document.createElement("div");

        message.className="message";

        form.appendChild(message);

    }

    message.className="message";

    if(type==="error"){

        message.classList.add("error");

    }

    message.textContent=text;

    message.style.display="block";

    setTimeout(()=>{

        message.style.display="none";

    },2500);

}

// ===============================
// CUSTOM CATEGORY
// ===============================

category.addEventListener("change",()=>{

    if(category.value==="Custom"){

        customCategoryGroup.style.display="flex";

    }else{

        customCategoryGroup.style.display="none";

        customCategory.value="";

    }

});

// ===============================
// ADD TRANSACTION
// ===============================

form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const name=itemName.value.trim();

    const money=parseFloat(amount.value);

    let selectedCategory=category.value;

    // VALIDATION

    if(

        name===""

        ||

        amount.value===""

        ||

        selectedCategory===""

    ){

        showMessage(

            "Please complete all fields.",

            "error"

        );

        return;

    }

    // CUSTOM CATEGORY

    if(selectedCategory==="Custom"){

        if(customCategory.value.trim()===""){

            showMessage(

                "Please enter custom category.",

                "error"

            );

            return;

        }

        selectedCategory=

        customCategory.value.trim();

    }

    // OBJECT

    const transaction={

        id:Date.now(),

        name:name,

        amount:money,

        category:selectedCategory,

        date:new Date().toLocaleDateString("id-ID")

    };

    // PUSH

    transactions.push(transaction);

    // SAVE

    saveTransactions();

    // UPDATE UI

    renderTransactions();

    updateBalance();

    updateChart();

    // RESET

    form.reset();

    customCategoryGroup.style.display="none";

    // MESSAGE

    showMessage(

        "Transaction added successfully."

    );

});
/* ==========================================
   PART 2
   SAVE - RENDER - DELETE - BALANCE
========================================== */

// ===============================
// SAVE LOCAL STORAGE
// ===============================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}

// ===============================
// ICON CATEGORY
// ===============================

function getCategoryIcon(category) {

    const text = category.toLowerCase();

    if (text === "food") {

        return {
            icon: "fa-utensils",
            className: "food"
        };

    }

    if (text === "transport") {

        return {
            icon: "fa-bus",
            className: "transport"
        };

    }

    if (text === "fun") {

        return {
            icon: "fa-gamepad",
            className: "fun"
        };

    }

    return {
        icon: "fa-tag",
        className: "custom"
    };

}

// ===============================
// RENDER TRANSACTIONS
// ===============================

function renderTransactions() {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {

        transactionList.innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-wallet"></i>

                <h3>No Transactions</h3>

                <p>

                    Add your first expense to start tracking your spending.

                </p>

            </div>

        `;

        return;

    }

    transactions.forEach(transaction => {

        const categoryData = getCategoryIcon(transaction.category);

        const item = document.createElement("div");

        item.className = "transaction-item";

        item.innerHTML = `

            <div class="transaction-left">

                <div class="icon-box ${categoryData.className}">

                    <i class="fa-solid ${categoryData.icon}"></i>

                </div>

                <div class="transaction-info">

                    <h4>${transaction.name}</h4>

                    <span>

                        ${transaction.category}

                        •

                        ${transaction.date}

                    </span>

                </div>

            </div>

            <div class="transaction-right">

                <h4>

                    ${formatRupiah(transaction.amount)}

                </h4>

                <button

                    class="delete-btn"

                    onclick="deleteTransaction(${transaction.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        `;

        transactionList.appendChild(item);

    });

}

// ===============================
// DELETE
// ===============================

function deleteTransaction(id) {

    const confirmDelete = confirm(

        "Delete this transaction?"

    );

    if (!confirmDelete) return;

    transactions = transactions.filter(

        transaction => transaction.id !== id

    );

    saveTransactions();

    renderTransactions();

    updateBalance();

    updateChart();

    showMessage("Transaction deleted.");

}

// ===============================
// UPDATE BALANCE
// ===============================

function updateBalance() {

    const total = transactions.reduce(

        (sum, transaction) =>

        sum + Number(transaction.amount),

        0

    );

    totalBalance.textContent = formatRupiah(total);

}

// ===============================
// FIRST LOAD
// ===============================

renderTransactions();

updateBalance();
/* ==========================================
   PART 3
   CHART - SORT - DARK MODE
========================================== */

// ===============================
// UPDATE PIE CHART
// ===============================

function updateChart() {

    const categoryTotal = {};

    transactions.forEach(transaction => {

        if (!categoryTotal[transaction.category]) {

            categoryTotal[transaction.category] = 0;

        }

        categoryTotal[transaction.category] += Number(transaction.amount);

    });

    const labels = Object.keys(categoryTotal);
    const data = Object.values(categoryTotal);

    const ctx = document
        .getElementById("expenseChart")
        .getContext("2d");

    if (expenseChart) {

        expenseChart.destroy();

    }

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{

                data: data,

                backgroundColor: [

                    "#2563eb",
                    "#f97316",
                    "#8b5cf6",
                    "#10b981",
                    "#ef4444",
                    "#14b8a6",
                    "#facc15"

                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

// ===============================
// SORT
// ===============================

sortSelect.addEventListener("change", () => {

    const value = sortSelect.value;

    if (value === "highest") {

        transactions.sort((a, b) => b.amount - a.amount);

    }

    else if (value === "lowest") {

        transactions.sort((a, b) => a.amount - b.amount);

    }

    else if (value === "category") {

        transactions.sort((a, b) =>

            a.category.localeCompare(b.category)

        );

    }

    else {

        transactions.sort((a, b) => b.id - a.id);

    }

    renderTransactions();

    saveTransactions();

});

// ===============================
// DARK MODE
// ===============================

const savedTheme =

localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeToggle.innerHTML =

    '<i class="fa-solid fa-sun"></i>';

}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (

        document.body.classList.contains("dark")

    ) {

        localStorage.setItem(

            "theme",

            "dark"

        );

        themeToggle.innerHTML =

        '<i class="fa-solid fa-sun"></i>';

    }

    else {

        localStorage.setItem(

            "theme",

            "light"

        );

        themeToggle.innerHTML =

        '<i class="fa-solid fa-moon"></i>';

    }

});

// ===============================
// INITIAL LOAD
// ===============================

renderTransactions();

updateBalance();

updateChart();
const todayDate = document.getElementById("todayDate");

const today = new Date();

todayDate.textContent = today.toLocaleDateString(
    "en-US",
    {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }
);