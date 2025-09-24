// ================== Navbar Smart Auth Link ==================
function updateNavbar() {
  const user = JSON.parse(localStorage.getItem("userProfile"));
  const authLink = document.getElementById("authLink");

  if (!authLink) return;

  if (user && user.name !== "Guest User") {
    // Logged in user
    authLink.innerHTML = `<a href="profile.html"><i class="fas fa-user"></i> ${user.name}</a>`;
  } else if (user && user.name === "Guest User") {
    // Guest user
    authLink.innerHTML = `<a href="profile.html"><i class="fas fa-user-circle"></i> Guest</a>`;
  } else {
    // Not logged in
    authLink.innerHTML = `<a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>`;
  }
}

// Call on every page load
window.addEventListener("load", updateNavbar);

// ================== Trip Planner (Advanced with Chart) ==================
let tripChart;

function calculateTrip() {
  const days = parseInt(document.getElementById("days")?.value) || 0;
  const cost = parseInt(document.getElementById("cost")?.value) || 0;
  const travel = parseInt(document.getElementById("travel")?.value) || 0;
  const food = parseInt(document.getElementById("food")?.value) || 0;
  const extra = parseInt(document.getElementById("extra")?.value) || 0;

  const result = document.getElementById("tripResult");
  const stayCost = days * cost;
  const total = stayCost + travel + food + extra;

  if (total > 0) {
    result.innerText = `Estimated Trip Cost: ₹${total}`;

    // ✅ Save trip summary to localStorage
    const tripData = { stay: stayCost, travel, food, extra, total };
    localStorage.setItem("lastTrip", JSON.stringify(tripData));
  } else {
    result.innerText = "⚠️ Please enter valid values!";
    return;
  }

  // Destroy old chart
  if (tripChart) {
    tripChart.destroy();
  }

  const ctx = document.getElementById("tripChart").getContext("2d");
  tripChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Stay", "Travel", "Food", "Extra"],
      datasets: [
        {
          data: [stayCost, travel, food, extra],
          backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#e91e63"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Trip Cost Breakdown",
          font: { size: 18, weight: "bold" },
        },
        legend: { position: "bottom" },
      },
    },
  });
}


// ================== Eco Score (Advanced Chart.js) ==================
let ecoChart; // store chart instance

function getEcoScore() {
  const vehicle = document.getElementById("vehicle")?.value;
  const scoreBox = document.getElementById("ecoResult");

  const scores = {
    "Bicycle": 100,
    "Walking": 95,
    "Metro": 80,
    "Motorcycle": 60,
    "Car (Petrol/Diesel)": 40,
    "Bus": 70,
    "Electric Vehicle": 85,
    "Train": 75,
  };

  const score = scores[vehicle] || 0;
  scoreBox.innerText = `Your Eco Score for ${vehicle}: ${score}/100`;

  // ✅ Save eco score to localStorage
  const ecoData = { vehicle, score };
  localStorage.setItem("lastEco", JSON.stringify(ecoData));

  // Destroy old chart if exists
  if (ecoChart) {
    ecoChart.destroy();
  }

  const ctx = document.getElementById("ecoChart").getContext("2d");

  // Dynamic gradient color
  let gradient = ctx.createLinearGradient(0, 0, 0, 400);
  if (score >= 80) {
    gradient.addColorStop(0, "#00c853"); // green
    gradient.addColorStop(1, "#a5d6a7");
  } else if (score >= 60) {
    gradient.addColorStop(0, "#fbc02d"); // yellow
    gradient.addColorStop(1, "#fff176");
  } else {
    gradient.addColorStop(0, "#e53935"); // red
    gradient.addColorStop(1, "#ef9a9a");
  }

  ecoChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [vehicle],
      datasets: [
        {
          label: "Eco Score",
          data: [score],
          backgroundColor: gradient,
          borderColor: "#333",
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Eco Score Visualization",
          font: { size: 18, weight: "bold" },
          color: "#2e7d32",
        },
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw}/100`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}
// ================== Bucket List (Advanced) ==================
function saveBucket() {
  const checkboxes = document.querySelectorAll("#bucketList input[type=checkbox]");
  const selected = [...checkboxes].filter(b => b.checked).map(b => b.value);
  localStorage.setItem("bucketList", JSON.stringify(selected));
  alert("✅ Bucket list saved!");
  showSavedBucket();
}

function loadBucket() {
  const saved = JSON.parse(localStorage.getItem("bucketList")) || [];
  document.querySelectorAll("#bucketList input[type=checkbox]").forEach(box => {
    if (saved.includes(box.value)) box.checked = true;
  });
}

function showSavedBucket() {
  const saved = JSON.parse(localStorage.getItem("bucketList")) || [];
  const savedDiv = document.getElementById("savedBucket");
  const bucketSummary = document.getElementById("bucketSummary");

  savedDiv.innerHTML = "";

  if (saved.length === 0) {
    bucketSummary.style.display = "none";
    return;
  }

  bucketSummary.style.display = "block";

  saved.forEach((place) => {
    savedDiv.innerHTML += `
      <div style="background:rgba(255,255,255,0.2);padding:12px;border-radius:8px;display:flex;align-items:center;gap:10px;">
        <i class="fas fa-map-marker-alt"></i> ${place}
      </div>
    `;
  });
}


// ================== Search City (Wikipedia API) ==================
async function searchCity() {
  const city = document.getElementById("cityInput")?.value.trim();
  const resultDiv = document.getElementById("cityResult");

  if (!city) return (resultDiv.innerHTML = "<p>⚠️ Please enter a city name.</p>");
  resultDiv.innerHTML = "<p>⏳ Fetching info...</p>";

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.type?.includes("not_found")) {
      resultDiv.innerHTML = `<p>❌ No results found for <b>${city}</b>.</p>`;
    } else {
      resultDiv.innerHTML = `
        <h3>${data.title}</h3>
        ${data.thumbnail ? `<img src="${data.thumbnail.source}" alt="${data.title}" style="max-width:200px;border-radius:8px;">` : ""}
        <p>${data.extract}</p>
        <a href="${data.content_urls.desktop.page}" target="_blank">Read more on Wikipedia</a>`;
    }
  } catch {
    resultDiv.innerHTML = "<p>❌ Error fetching data. Please try again.</p>";
  }
}

// ================== Tourist Places (Wikipedia API alternative) ==================
async function searchPlaceAlt() {
  const query = document.getElementById("placeInput")?.value.trim();
  const resultDiv = document.getElementById("placeResult");

  if (!query) return (resultDiv.innerHTML = "<p>⚠️ Please enter a place name.</p>");
  resultDiv.innerHTML = "<p>⏳ Fetching info...</p>";

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.type?.includes("not_found")) {
      resultDiv.innerHTML = `<p>❌ No results found for <b>${query}</b>.</p>`;
    } else {
      resultDiv.innerHTML = `
        <div class="photo-card">
          ${data.thumbnail ? `<img src="${data.thumbnail.source}" alt="${data.title}">` : ""}
          <h3>${data.title}</h3>
          <p>${data.extract}</p>
          <a href="${data.content_urls.desktop.page}" target="_blank">Read more</a>
        </div>`;
    }
  } catch {
    resultDiv.innerHTML = "<p>❌ Error fetching data. Please try again.</p>";
  }
}

// ================== Preloader ==================
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const mainContent = document.querySelector("main");
  if (preloader) {
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.display = "none";
      mainContent?.classList.add("loaded");
    }, 500);
  }
});
// ================== SOS Emergency ==================
function openSOS() {
  const modal = document.getElementById("sosModal");
  if (!modal) return;

  // Load user emergency contacts
  const user = JSON.parse(localStorage.getItem("userProfile")) || {};
  const emergencyDiv = document.getElementById("userEmergency");

  if (user.contact1 || user.contact2) {
    emergencyDiv.innerHTML = `
      ${user.contact1 ? `<p><a href="tel:${user.contact1}">❤️ Contact 1 - ${user.contact1}</a></p>` : ""}
      ${user.contact2 ? `<p><a href="tel:${user.contact2}">❤️ Contact 2 - ${user.contact2}</a></p>` : ""}
    `;
  } else {
    emergencyDiv.innerHTML = `<p>No personal emergency contacts set.</p>`;
  }

  modal.style.display = "flex";
}

function closeSOS() {
  document.getElementById("sosModal").style.display = "none";
}
// ================== Auto Highlight Active Nav Link ==================
window.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop(); // current page name
  const navLinks = document.querySelectorAll("#navbar a");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === path) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
// ================== Tourist Places by City ==================
function searchTouristPlaces() {
  const city = document.getElementById("citySearch").value.trim().toLowerCase();
  const resultDiv = document.getElementById("placesResult");

  const data = {
    agra: [
      "Taj Mahal",
      "Agra Fort",
      "Mehtab Bagh",
      "Fatehpur Sikri"
    ],
    lucknow: [
      "Bara Imambara",
      "Rumi Darwaza",
      "Ambedkar Memorial Park",
      "Hazratganj Market"
    ],
    kanpur: [
      "Blue World Theme Park",
      "Allen Forest Zoo",
      "Moti Jheel",
      "JK Temple"
    ],
    delhi: [
      "India Gate",
      "Red Fort",
      "Qutub Minar",
      "Lotus Temple"
    ]
  };

  if (!city || !data[city]) {
    resultDiv.innerHTML = `<p>⚠️ No tourist data found for <b>${city}</b>. Try Agra, Lucknow, Kanpur, or Delhi.</p>`;
    return;
  }

  // Display results
  resultDiv.innerHTML = data[city].map(place => `
    <div class="place-card">
      <i class="fas fa-map-marker-alt"></i>
      <span>${place}</span>
    </div>
  `).join("");
}
