let allReports = [];
let savedReports = [];

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

document.addEventListener("DOMContentLoaded", () => {
    setupUser();
    setupLogout();
    setupFilters();
    setupSearch();
    setupMenu();
    fetchReports();
});

// ================= USER =================

function setupUser() {
    const usernameTab = document.getElementById("usernameTab");

    if (user && user.username) {
        usernameTab.textContent = user.username;
    } else {
        usernameTab.textContent = "Guest User";
    }
}

// ================= LOGOUT =================

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });
}

// ================= REPORTS =================

async function fetchReports() {
    try {
        const response = await fetch("http://localhost:5000/api/reports");
        allReports = await response.json();

        document.getElementById("reportResultCount").textContent =
            `${allReports.length} Reports Loaded`;

        renderReports(allReports);

    } catch (err) {
        console.error(err);
    }
}

function renderReports(reports) {
    const grid = document.getElementById("reportsGrid");

    grid.innerHTML = "";

    reports.forEach(report => {

        const card = document.createElement("div");
        card.className = "work-card";

        card.innerHTML = `
            <div class="card-icon">
                <i class="fa-solid fa-chart-line"></i>
            </div>

            <h3>${report.title}</h3>

            <div class="card-category">
                Category: ${report.category}
            </div>

            <p>${report.description}</p>

            <div class="card-footer">
                <span class="card-metric">
                    ${report.metric || "N/A"}
                </span>

                ${
                    token
                    ?
                    `<a href="#" class="card-link save-btn"
                        data-id="${report.id}">
                        <i class="fa-regular fa-bookmark"></i>
                        Save
                    </a>`
                    :
                    ``
                }
            </div>
        `;

        grid.appendChild(card);
    });

    setupSaveButtons();
}

// ================= SAVE =================

function setupSaveButtons() {

    document.querySelectorAll(".save-btn").forEach(btn => {

        btn.addEventListener("click", e => {

            e.preventDefault();

            const reportId = btn.dataset.id;

            if (!token) {
                alert("Login required");
                return;
            }

            if (!savedReports.includes(reportId)) {

                savedReports.push(reportId);

                btn.innerHTML =
                    `<i class="fa-solid fa-bookmark"></i> Saved`;

            }

            updateSavedCount();
        });
    });
}

function updateSavedCount() {

    document.getElementById("savedCount").textContent =
        savedReports.length;

    document.getElementById("metricSavedCount").textContent =
        savedReports.length;
}

// ================= SEARCH =================

function setupSearch() {

    const searchInput =
        document.getElementById("searchInput");

    searchInput.addEventListener("input", () => {

        const value =
            searchInput.value.toLowerCase();

        const filtered =
            allReports.filter(r =>
                r.title.toLowerCase().includes(value)
            );

        renderReports(filtered);
    });
}

// ================= FILTER =================

function setupFilters() {

    document.querySelectorAll(".filter-btn")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            document.querySelectorAll(".filter-btn")
            .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            const category =
                btn.dataset.category;

            if (category === "All") {
                renderReports(allReports);
                return;
            }

            const filtered =
                allReports.filter(r =>
                    r.category === category
                );

            renderReports(filtered);
        });
    });
}

// ================= MENU =================

function setupMenu() {

    const menuAll =
        document.getElementById("menuAll");

    const menuSaved =
        document.getElementById("menuSaved");

    const menuProfile =
        document.getElementById("menuProfile");

    menuAll.addEventListener("click", e => {
        e.preventDefault();
        renderReports(allReports);
    });

    menuSaved.addEventListener("click", e => {

        e.preventDefault();

        if (!token) {
            alert("Login required");
            return;
        }

        const filtered =
            allReports.filter(r =>
                savedReports.includes(String(r.id))
            );

        renderReports(filtered);
    });

    menuProfile.addEventListener("click", e => {

        e.preventDefault();

        if (!user) {
            alert("Login required");
            return;
        }

        alert(
            `Username: ${user.username}\nEmail: ${user.email}`
        );
    });
}