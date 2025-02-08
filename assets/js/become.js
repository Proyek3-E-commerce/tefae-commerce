const video = document.getElementById("camera");
const captureButton = document.getElementById("capture-photo");
const photoPreview = document.getElementById("photo-preview");
const cameraSection = document.getElementById("camera-section");

navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.error("Error accessing camera:", err);
    });

    captureButton.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL("image/png");
    console.log("Photo captured:", photoData.slice(0, 100)); // Debugging data foto
    photoPreview.src = photoData;
    photoPreview.classList.remove("hidden");

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    cameraSection.classList.add("hidden");
});

document.getElementById("seller-application-form").addEventListener("submit", async function (e) {
e.preventDefault();

const storeName = document.getElementById("store-name").value;
const address = document.getElementById("address").value;
const nik = document.getElementById("nik").value;
const photo = photoPreview.src; // Ambil data URL dari foto

// Validasi input
if (!storeName || !address || !nik) {
alert("Please fill in all fields.");
return;
}

if (!photo || photo.includes("hidden")) {
alert("Please capture a photo with your ID card.");
return;
}

const token = localStorage.getItem("token");

// Konversi Base64 menjadi file Blob
const base64Data = photo.split(",")[1]; // Hanya data setelah koma
const byteCharacters = atob(base64Data);
const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
const byteArray = new Uint8Array(byteNumbers);
const blob = new Blob([byteArray], { type: "image/png" });

// Siapkan FormData
const formData = new FormData();
formData.append("store_name", storeName);
formData.append("full_address", address);
formData.append("nik", nik);
formData.append("photo", blob, "photo.png");

try {
const response = await fetch("https://tefae-commerce-2c0fdca4d608.herokuapp.com/become-seller", {
    method: "POST",
    headers: {
        Authorization: `Bearer ${token}`, // Token dikirim di header
    },
    body: formData, // Kirim sebagai multipart/form-data
});

if (response.ok) {
    document.getElementById("success-message").style.display = "block";
    document.getElementById("error-message").style.display = "none";

    // Alihkan ke halaman index.html setelah 2 detik
    setTimeout(() => {
        window.location.href = "index.html";
    }, 2000); // 2000ms = 2 detik
} else {
    const errorData = await response.json();
    console.error("Error:", errorData.message);
    alert(errorData.message);
}
} catch (error) {
console.error("Error submitting application:", error);
document.getElementById("error-message").style.display = "block";
document.getElementById("success-message").style.display = "none";
}
});
