/**
 * =========================================================================
 * APP.JS - Logika Utama Frontend Undangan Digital Dharu & Widiya
 * =========================================================================
 * Mengatur:
 * - Navigasi slide berbasis tap layar (penguncian transisi, no swipe)
 * - Pemutaran musik latar otomatis & toggle tombol melayang
 * - Parse parameter nama tamu (?to=Nama)
 * - Countdown real-time ke tanggal pernikahan
 * - Galeri foto & Lightbox modal
 * - Salin nomor rekening ke clipboard & Toast alert
 * - RSVP & Ucapan (API Express + Fallback LocalStorage untuk static hosting)
 * - Bottom Navigation Bar (5 ikon penanda aktif)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Pastikan konfigurasi tersedia
  const config = window.WEDDING_CONFIG || {};

  // -----------------------------------------------------------------------
  // ELEMEN DOM
  // -----------------------------------------------------------------------
  const slides = Array.from(document.querySelectorAll('.slide'));
  const viewport = document.getElementById('slidesViewport');
  const bottomNav = document.getElementById('bottomNav');
  const navItems = document.querySelectorAll('.nav-item');
  const tapHint = document.getElementById('tapHint');
  const preloader = document.getElementById('preloader');
  
  // Audio
  const audioBtn = document.getElementById('audioBtn');
  const bgMusic = document.getElementById('bgMusic');
  
  // Lightbox
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  
  // Toast
  const toastNotice = document.getElementById('toastNotice');

  // RSVP Elements
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpName = document.getElementById('rsvpName');
  const rsvpMessage = document.getElementById('rsvpMessage');
  const rsvpStatus = document.getElementById('rsvpStatus');
  const commentsList = document.getElementById('commentsList');
  const commentsCountEl = document.getElementById('commentsCount');
  const statHadirEl = document.getElementById('statHadir');
  const statTidakHadirEl = document.getElementById('statTidakHadir');
  const statRaguEl = document.getElementById('statRagu');

  // Countdown Elements
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');

  // State Aplikasi
  let currentSlideIndex = 0;
  let isTransitioning = false;
  let isAudioPlaying = false;
  let hasCoverBeenOpened = false;
  let apiAvailable = true;

  // Key LocalStorage untuk token pemilik ucapan
  const LOCAL_STORAGE_OWNED_IDS = 'dharu_widi_owned_wishes';
  const LOCAL_STORAGE_WISHES_FALLBACK = 'dharu_widi_local_wishes';

  // -----------------------------------------------------------------------
  // 1. INISIALISASI & PRELOADER
  // -----------------------------------------------------------------------
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 450);
  });

  // Ambil parameter nama tamu dari URL
  function setupGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestParamKey = (config.guest && config.guest.queryParam) || 'to';
    const guestName = urlParams.get(guestParamKey) || (config.guest && config.guest.defaultName) || 'Tamu Undangan';
    
    const guestEl = document.getElementById('coverGuestName');
    if (guestEl) {
      guestEl.textContent = guestName;
    }
  }
  setupGuestName();

  // -----------------------------------------------------------------------
  // 2. NAVIGASI SLIDE BERBASIS TAP (PENGUNCIAN & TRANSISI HALUS)
  // -----------------------------------------------------------------------
  function goToSlide(targetIndex) {
    if (isTransitioning) return;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    if (targetIndex === currentSlideIndex) return;

    isTransitioning = true;
    const currentSlide = slides[currentSlideIndex];
    const nextSlide = slides[targetIndex];

    // Fade out slide lama
    currentSlide.classList.remove('active');

    setTimeout(() => {
      currentSlideIndex = targetIndex;
      nextSlide.classList.add('active');

      // Update Bottom Nav active indicator
      updateBottomNavActive(targetIndex);

      // Sembunyikan hint tap setelah melewati slide 3
      if (currentSlideIndex > 3 && tapHint) {
        tapHint.classList.add('hidden');
      }

      // Kunci transisi dibuka setelah animasi stagger masuk
      setTimeout(() => {
        isTransitioning = false;
      }, 650);
    }, 350);
  }

  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  // Klik/Tap layar untuk lanjut ke slide berikutnya
  viewport.addEventListener('click', (e) => {
    // Pada cover (slide 0), klik hanya boleh lewat tombol "Open Invitation"
    if (currentSlideIndex === 0) return;
    nextSlide();
  });

  // Tombol "Open Invitation" di Cover
  const btnOpenInvitation = document.getElementById('btnOpenInvitation');
  if (btnOpenInvitation) {
    btnOpenInvitation.addEventListener('click', (e) => {
      e.stopPropagation();
      hasCoverBeenOpened = true;

      // Putar musik latar
      playAudio();

      // Tampilkan bottom navigation bar
      if (bottomNav) {
        bottomNav.classList.add('visible');
      }

      // Pindah ke slide 2 (Mempelai)
      goToSlide(1);

      // Tampilkan hint tap di slide 2
      if (tapHint) {
        tapHint.classList.remove('hidden');
      }
    });
  }

  // -----------------------------------------------------------------------
  // 3. BOTTOM NAVIGATION BAR
  // Mapping 5 Icon ke Slide:
  // Icon 0: Amplop -> Slide 1 (Mempelai Overview)
  // Icon 1: Couple -> Slide 4 (Mempelai Pria/Wanita)
  // Icon 2: Kalender -> Slide 6 (Akad & Resepsi)
  // Icon 3: Galeri -> Slide 8 (Galeri Foto)
  // Icon 4: RSVP -> Slide 10 (RSVP & Penutup)
  // -----------------------------------------------------------------------
  const navSlideTargets = [1, 4, 6, 8, 10];

  navItems.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = navSlideTargets[idx];
      if (target !== undefined) {
        goToSlide(target);
      }
    });
  });

  function updateBottomNavActive(slideIdx) {
    let activeNavIdx = 0;
    if (slideIdx <= 2) {
      activeNavIdx = 0; // Awal / Mempelai
    } else if (slideIdx >= 3 && slideIdx <= 5) {
      activeNavIdx = 1; // Mempelai Pria/Wanita
    } else if (slideIdx === 6 || slideIdx === 7) {
      activeNavIdx = 2; // Acara (Akad / Resepsi)
    } else if (slideIdx === 8) {
      activeNavIdx = 3; // Galeri
    } else {
      activeNavIdx = 4; // RSVP / Penutup
    }

    navItems.forEach((btn, i) => {
      if (i === activeNavIdx) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Hentikan propagasi klik pada elemen interaktif agar tidak memicu pindah slide
  const interactiveSelectors = [
    'button',
    'a',
    'input',
    'textarea',
    'select',
    '.gallery-photo-card',
    '.bottom-nav',
    '.audio-btn',
    '.lightbox-modal',
    '.rsvp-card-wrapper',
    '.cashless-card-box'
  ];

  interactiveSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
  });

  // -----------------------------------------------------------------------
  // 4. PEMUTAR MUSIK LATAR & TOMBOL TOGGLE
  // -----------------------------------------------------------------------
  function playAudio() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isAudioPlaying = true;
      audioBtn.classList.add('spinning');
    }).catch(err => {
      console.log('Autoplay ditolak oleh browser, menunggu interaksi pengguna.', err);
    });
  }

  function pauseAudio() {
    if (!bgMusic) return;
    bgMusic.pause();
    isAudioPlaying = false;
    audioBtn.classList.remove('spinning');
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isAudioPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });
  }

  // -----------------------------------------------------------------------
  // 5. COUNTDOWN REAL-TIME
  // -----------------------------------------------------------------------
  function initCountdown() {
    const targetDate = new Date(config.countdownTarget || '2027-08-31T08:00:00+08:00').getTime();

    function updateTimer() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        if (cdDays) cdDays.textContent = '00';
        if (cdHours) cdHours.textContent = '00';
        if (cdMinutes) cdMinutes.textContent = '00';
        if (cdSeconds) cdSeconds.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const pad = (n) => String(n).padStart(2, '0');

      if (cdDays) cdDays.textContent = pad(days);
      if (cdHours) cdHours.textContent = pad(hours);
      if (cdMinutes) cdMinutes.textContent = pad(minutes);
      if (cdSeconds) cdSeconds.textContent = pad(seconds);
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }
  initCountdown();

  // -----------------------------------------------------------------------
  // 6. GALERI FOTO & LIGHTBOX MODAL
  // -----------------------------------------------------------------------
  const photoCards = document.querySelectorAll('.gallery-photo-card');
  photoCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const img = card.querySelector('img');
      const caption = card.getAttribute('data-caption') || '';
      if (img && lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption;
        lightboxModal.classList.add('open');
      }
    });
  });

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('open');
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // -----------------------------------------------------------------------
  // 7. CASHLESS - COPY ACCOUNT & TOAST NOTIFICATION
  // -----------------------------------------------------------------------
  function showToast(message) {
    if (!toastNotice) return;
    toastNotice.textContent = message;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2400);
  }

  const copyButtons = document.querySelectorAll('.btn-copy-account');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const accountNum = btn.getAttribute('data-account');
      if (accountNum) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(accountNum).then(() => {
            showToast(config.cashless?.copySuccessToast || 'Nomor rekening berhasil disalin!');
          }).catch(() => {
            fallbackCopy(accountNum);
          });
        } else {
          fallbackCopy(accountNum);
        }
      }
    });
  });

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(config.cashless?.copySuccessToast || 'Nomor rekening berhasil disalin!');
  }

  // -----------------------------------------------------------------------
  // 8. RSVP & UCAPAN (EXPRESS API + FALLBACK LOCALSTORAGE)
  // -----------------------------------------------------------------------
  function getOwnedIds() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_OWNED_IDS) || '[]');
    } catch {
      return [];
    }
  }

  function addOwnedId(id) {
    const list = getOwnedIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(LOCAL_STORAGE_OWNED_IDS, JSON.stringify(list));
    }
  }

  function removeOwnedId(id) {
    let list = getOwnedIds();
    list = list.filter(item => item !== id);
    localStorage.setItem(LOCAL_STORAGE_OWNED_IDS, JSON.stringify(list));
  }

  function formatTimeRelative(isoString) {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 60) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} menit lalu`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} jam lalu`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay} hari lalu`;
      const diffWeek = Math.floor(diffDay / 7);
      if (diffWeek < 4) return `${diffWeek} minggu lalu`;
      const diffMonth = Math.floor(diffDay / 30);
      return `${diffMonth} bulan lalu`;
    } catch {
      return '';
    }
  }

  function renderComments(wishes) {
    if (!commentsList) return;
    commentsList.innerHTML = '';

    const ownedIds = getOwnedIds();

    let hadirCount = 0;
    let tidakHadirCount = 0;
    let raguCount = 0;

    wishes.forEach(item => {
      // Hitung statistik
      if (item.status === 'Hadir') hadirCount++;
      else if (item.status === 'Tidak Hadir') tidakHadirCount++;
      else raguCount++;

      const isOwner = ownedIds.includes(item.id);

      const itemDiv = document.createElement('div');
      itemDiv.className = 'comment-item';
      itemDiv.setAttribute('data-id', item.id);

      let badgeClass = '';
      let badgeIcon = '✓';
      if (item.status === 'Tidak Hadir') {
        badgeClass = 'tidak-hadir';
        badgeIcon = '✕';
      } else if (item.status === 'Masih Ragu') {
        badgeClass = 'ragu';
        badgeIcon = '?';
      }

      itemDiv.innerHTML = `
        <div class="comment-header">
          <span class="comment-name">${item.name}</span>
          <span class="comment-check-badge ${badgeClass}" title="${item.status}">${badgeIcon}</span>
        </div>
        <div class="comment-message">${item.message}</div>
        <div class="comment-footer">
          <span>${formatTimeRelative(item.createdAt)}</span>
          ${isOwner ? `
            <div class="comment-actions">
              <button class="btn-action-text btn-edit" data-id="${item.id}">Edit</button>
              <button class="btn-action-text btn-delete" data-id="${item.id}">Delete</button>
            </div>
          ` : ''}
        </div>
      `;

      commentsList.appendChild(itemDiv);
    });

    // Update Counter UI
    if (commentsCountEl) commentsCountEl.textContent = `${wishes.length} Comments`;
    if (statHadirEl) statHadirEl.textContent = hadirCount;
    if (statTidakHadirEl) statTidakHadirEl.textContent = tidakHadirCount;
    if (statRaguEl) statRaguEl.textContent = raguCount;

    // Attach Event Edit & Delete
    attachActionEvents();
  }

  function attachActionEvents() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        handleEditWish(id);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        handleDeleteWish(id);
      });
    });
  }

  // Load Ucapan dari Server atau LocalStorage Fallback
  async function loadWishes() {
    try {
      const res = await fetch('/api/ucapan');
      if (!res.ok) throw new Error('API Ucapan tidak aktif');
      const data = await res.json();
      apiAvailable = true;
      renderComments(data);
    } catch (err) {
      console.warn('Mode fallback: Menggunakan LocalStorage untuk ucapan.', err);
      apiAvailable = false;
      const localData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_WISHES_FALLBACK) || '[]');
      // Jika lokal masih kosong, beri seed awal
      if (localData.length === 0) {
        const seedWishes = [
          {
            id: 'local_1',
            name: 'Bonggo',
            message: 'Happy Wedding Widiya & Dharu! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
            status: 'Hadir',
            createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
          },
           {
            id: 'local_3',
            name: 'Choi Soobin',
            message: '행복한 결혼식되세요 위디야와 다루님',
            status: 'Tidak Hadir',
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
          },
          {
            id: 'local_4',
            name: 'Kazuha',
            message: '위디야와 함께 이 세상과 내세에서 당신의 삶이 영원히 지속되기를 바랍니다.',
            status: 'Tidak Hadir',
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
          },
          {
            id: 'local_2',
            name: 'Desi Fitriani',
            message: 'Selamat ya Widiya & Dharu, lancar lancar semuanya sampai hari H Aamiin!',
            status: 'Hadir',
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
          }
        ];
        localStorage.setItem(LOCAL_STORAGE_WISHES_FALLBACK, JSON.stringify(seedWishes));
        renderComments(seedWishes);
      } else {
        renderComments(localData);
      }
    }
  }
  loadWishes();

  // Submit Ucapan Baru
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const name = rsvpName.value.trim();
      const message = rsvpMessage.value.trim();
      const status = rsvpStatus.value;

      if (!name || !message) {
        showToast('Nama dan Ucapan wajib diisi!');
        return;
      }

      const submitBtn = rsvpForm.querySelector('.btn-rsvp-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Mengirim...';

      if (apiAvailable) {
        try {
          const res = await fetch('/api/ucapan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, message, status })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Gagal mengirim ucapan');
          }

          const result = await res.json();
          addOwnedId(result.item.id);
          showToast('Ucapan berhasil dikirim!');
          rsvpForm.reset();
          loadWishes();
        } catch (err) {
          showToast(err.message || 'Terjadi kesalahan');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Kirim';
        }
      } else {
        // Fallback LocalStorage
        const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_WISHES_FALLBACK) || '[]');
        const newLocalItem = {
          id: `loc_${Date.now()}`,
          name: name,
          message: message,
          status: status,
          createdAt: new Date().toISOString()
        };
        localList.unshift(newLocalItem);
        localStorage.setItem(LOCAL_STORAGE_WISHES_FALLBACK, JSON.stringify(localList));
        addOwnedId(newLocalItem.id);
        showToast('Ucapan tersimpan di perangkat!');
        rsvpForm.reset();
        renderComments(localList);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim';
      }
    });
  }

  // Handle Edit Ucapan
  async function handleEditWish(id) {
    const newMsg = prompt('Edit pesan ucapan Anda:');
    if (!newMsg || newMsg.trim().length === 0) return;

    if (apiAvailable) {
      try {
        const res = await fetch(`/api/ucapan/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMsg.trim() })
        });
        if (!res.ok) throw new Error('Gagal memperbarui ucapan');
        showToast('Ucapan berhasil diperbarui!');
        loadWishes();
      } catch (err) {
        showToast(err.message);
      }
    } else {
      const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_WISHES_FALLBACK) || '[]');
      const target = localList.find(x => x.id === id);
      if (target) {
        target.message = newMsg.trim();
        target.updatedAt = new Date().toISOString();
        localStorage.setItem(LOCAL_STORAGE_WISHES_FALLBACK, JSON.stringify(localList));
        showToast('Ucapan berhasil diperbarui!');
        renderComments(localList);
      }
    }
  }

  // Handle Delete Ucapan
  async function handleDeleteWish(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus ucapan ini?')) return;

    if (apiAvailable) {
      try {
        const res = await fetch(`/api/ucapan/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Gagal menghapus ucapan');
        removeOwnedId(id);
        showToast('Ucapan berhasil dihapus!');
        loadWishes();
      } catch (err) {
        showToast(err.message);
      }
    } else {
      let localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_WISHES_FALLBACK) || '[]');
      localList = localList.filter(x => x.id !== id);
      localStorage.setItem(LOCAL_STORAGE_WISHES_FALLBACK, JSON.stringify(localList));
      removeOwnedId(id);
      showToast('Ucapan berhasil dihapus!');
      renderComments(localList);
    }
  }
});
