// // Sidebar toggle
const sideMenu = document.querySelector('aside');
const menuBtn = document.querySelector('#menu_bar');
const closeBtn = document.querySelector('#close_btn');
const mainContent = document.querySelector('main'); // Elemen utama untuk dinamis konten
const links = document.querySelectorAll('.sidebar a'); // Semua tautan di sidebar

menuBtn.addEventListener('click', () => {
    sideMenu.style.display = "block";
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = "none";
});

// Fungsi untuk memuat konten berdasarkan klik
function loadContent(target) {
    switch (target) {
        case "Dashboard":
            mainContent.innerHTML = `
                <h1>Dashboard</h1>
                <div class="date">
                    <input type="date">
                </div>
                <div class="insights">
                    <div class="sales">
                        <span class="material-symbols-sharp">trending_up</span>
                        <div class="middle">
                            <div class="left">
                                <h3>Total Sales</h3>
                                <h1>Rp 25,024,000</h1>
                            </div>
                            <div class="progress">
                                <svg>
                                    <circle r="30" cy="40" cx="40"></circle>
                                </svg>
                                <div class="number"><p>80%</p></div>
                            </div>
                        </div>
                        <small>Last 24 Hours</small>
                    </div>
                    <div class="expenses">
                        <span class="material-symbols-sharp">local_mall</span>
                        <div class="middle">
                            <div class="left">
                                <h3>Total Expenses</h3>
                                <h1>Rp 15,000,000</h1>
                            </div>
                            <div class="progress">
                                <svg>
                                    <circle r="30" cy="40" cx="40"></circle>
                                </svg>
                                <div class="number"><p>60%</p></div>
                            </div>
                        </div>
                        <small>Last 24 Hours</small>
                    </div>
                    <div class="income">
                        <span class="material-symbols-sharp">stacked_line_chart</span>
                        <div class="middle">
                            <div class="left">
                                <h3>Total Income</h3>
                                <h1>Rp 10,024,000</h1>
                            </div>
                            <div class="progress">
                                <svg>
                                    <circle r="30" cy="40" cx="40"></circle>
                                </svg>
                                <div class="number"><p>40%</p></div>
                            </div>
                        </div>
                        <small>Last 24 Hours</small>
                    </div>
                </div>
                <div class="recent_order">
                    <h2>Recent Orders</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Product Number</th>
                                <th>Payments</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Mini USB</td>
                                <td>4563</td>
                                <td>Rp 50,000</td>
                                <td class="warning">Pending</td>
                                <td class="primary">Details</td>
                            </tr>
                            <tr>
                                <td>Bluetooth Speaker</td>
                                <td>7890</td>
                                <td>Rp 200,000</td>
                                <td class="success">Completed</td>
                                <td class="primary">Details</td>
                            </tr>
                        </tbody>
                    </table>
                    <a href="#">Show All</a>
                </div>
            `;
            break;

        case "Customers":
            mainContent.innerHTML = `
                <h1>Customers</h1>
                <p>Konten halaman Customers ditampilkan di sini.</p>
            `;
            break;

        case "Sellers":
            mainContent.innerHTML = `
                <h1>Sellers</h1>
                <p>Konten halaman Sellers ditampilkan di sini.</p>
            `;
            break;

        default:
            mainContent.innerHTML = `
                <h1>${target}</h1>
                <p>Konten halaman ${target} ditampilkan di sini.</p>
            `;
    }
}

// Tambahkan event listener untuk semua tautan sidebar
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Mencegah aksi default
        const target = e.currentTarget.querySelector('h3').textContent.trim(); // Ambil teks tautan
        loadContent(target); // Panggil fungsi untuk memuat konten
    });
});

// Load dashboard sebagai halaman utama
loadContent("Dashboard");


