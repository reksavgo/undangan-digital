import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB2ldOEq9FWj3KBzbsIimQHURRQ4QrJWrc",
  authDomain: "invitation-ht.firebaseapp.com",
  projectId: "invitation-ht",
  storageBucket: "invitation-ht.firebasestorage.app",
  messagingSenderId: "75638596972",
  appId: "1:75638596972:web:1fe3a6c3047dea3eba7f49",
  measurementId: "G-DP42LM9Q4K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inisialisasi AOS (Animasi)
AOS.init({ duration: 1000, once: true });

// 1. FUNGSI TOMBOL BUKA UNDANGAN (AUTO-SCROLL PELAN SAMPAI BAWAH)
const tombolBuka = document.getElementById("tombol-buka");
if (tombolBuka) {
  tombolBuka.addEventListener("click", function() {
    
    const konten = document.getElementById('konten-utama');
    if (konten) {
      // Munculkan konten ke layar
      konten.classList.remove('hidden');
      konten.style.display = "block"; 
      
      // Putar Musik
      const music = document.getElementById('bg-music');
      if (music) {
        music.play().catch(err => console.log("Musik diblokir: ", err));
      }

      // Beri jeda 0.5 detik agar web siap, lalu mulai jalan pelan-pelan ke bawah
      setTimeout(() => {
        let scrollInterval = setInterval(() => {
          // Angka top: 3 adalah kecepatannya. Bisa diganti 4 atau 5 kalau kurang cepat
          window.scrollBy({ top: 2, left: 0, behavior: 'auto' }); 

          // Berhenti otomatis kalau sudah sampai paling bawah
          if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
            clearInterval(scrollInterval);
          }
        }, 20); // Jeda pergerakan (milidetik)

        // Berhenti kalau tamu menyentuh layar atau nge-scroll sendiri
        const stopScroll = () => {
          clearInterval(scrollInterval);
          window.removeEventListener('wheel', stopScroll);
          window.removeEventListener('touchstart', stopScroll);
        };

        window.addEventListener('wheel', stopScroll);
        window.addEventListener('touchstart', stopScroll);
        
      }, 500); 
    }
  });
}

// 2. FITUR COUNTDOWN TIMER (Menuju 30 Mei 2025)
const targetDate = new Date("November 14, 2026 08:00:00").getTime();
setInterval(() => {
  const now = new Date().getTime();
  const distance = targetDate - now;
  const countdownElement = document.getElementById("countdown");

  if (distance < 0) {
    if (countdownElement) countdownElement.innerHTML = "<h3>Acara Telah Berlangsung</h3>";
    return;
  }

  const daysElem = document.getElementById("days");
  const hoursElem = document.getElementById("hours");
  const minutesElem = document.getElementById("minutes");
  const secondsElem = document.getElementById("seconds");

  if (daysElem) daysElem.innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
  if (hoursElem) hoursElem.innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (minutesElem) minutesElem.innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  if (secondsElem) secondsElem.innerText = Math.floor((distance % (1000 * 60)) / 1000);
}, 1000);

// 3. FUNGSI KIRIM UCAPAN KE FIREBASE
const formUcapan = document.getElementById("form-ucapan");
if (formUcapan) {
  formUcapan.addEventListener("submit", async function(event) {
    event.preventDefault();
    const nama = document.getElementById("input-nama").value;
    const status = document.getElementById("input-status").value;
    const pesan = document.getElementById("input-pesan").value;

    try {
      await addDoc(collection(db, "ucapan"), {
        nama: nama, 
        status: status, 
        pesan: pesan, 
        waktu: serverTimestamp()
      });
      formUcapan.reset();
    } catch (e) {
      console.error("Gagal mengirim:", e);
      alert("Gagal mengirim ucapan, pastikan internet stabil!");
    }
  });
}

// 4. TAMPILKAN UCAPAN SECARA REAL-TIME
const daftarUcapan = document.getElementById("daftar-ucapan");
if (daftarUcapan) {
  onSnapshot(collection(db, "ucapan"), (snapshot) => {
    daftarUcapan.innerHTML = ""; 
    snapshot.forEach((doc) => {
      const data = doc.data();
      const badgeClass = data.status === "Hadir" ? "hadir" : "tidak";
      const itemBaru = document.createElement("div");
      itemBaru.classList.add("ucapan-item");
      itemBaru.innerHTML = `
        <div class="ucapan-header">
          <strong>${data.nama}</strong><span class="badge ${badgeClass}">${data.status}</span>
        </div>
        <p>${data.pesan}</p>`;
      daftarUcapan.appendChild(itemBaru);
    });
  });
}