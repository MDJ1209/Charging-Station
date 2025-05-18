document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const qrModal = document.getElementById('qrModal');
    const timerScreen = document.getElementById('timerScreen');
    const timerDisplay = document.getElementById('timer');
    const closeModal = document.querySelector('.close');
    const scanPayButtons = document.querySelectorAll('.scan-pay');
    const customScanBtn = document.querySelector('.custom-scan');
    const timeSlider = document.getElementById('timeSlider');
    const sliderValue = document.getElementById('sliderValue');
    const customPrice = document.getElementById('customPrice');
    const userDetailsForm = document.getElementById('userDetailsForm');
    const userName = document.getElementById('userName');
    const userMobile = document.getElementById('userMobile');
    const qrSection = document.getElementById('qrSection');
    const paidBtn = document.getElementById('paidBtn');
    const paymentSuccess = document.getElementById('paymentSuccess');
    const minimizeTimerBtn = document.getElementById('minimizeTimer');
    const backgroundTimerToggle = document.getElementById('backgroundTimer');

    // Timer variables
    let timerInterval;
    let remainingTime = 0;
    let runInBackground = false;
    let timerStarted = false;
    let selectedMinutes = 30;
    let selectedPrice = 5;

    // Pricing logic: ₹5 per 30 min
    function calculatePrice(minutes) {
        return Math.ceil(minutes / 30) * 5;
    }

    // Update slider value and price
    function updateSlider() {
        const minutes = parseInt(timeSlider.value);
        sliderValue.textContent = minutes;
        const price = calculatePrice(minutes);
        customPrice.textContent = price;
        customScanBtn.setAttribute('data-minutes', minutes);
        customScanBtn.setAttribute('data-price', price);
    }
    timeSlider.addEventListener('input', updateSlider);
    updateSlider();

    // Payment card click logic
    document.querySelectorAll('.payment-card .scan-pay').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.payment-card');
            selectedMinutes = parseInt(card.getAttribute('data-minutes'));
            selectedPrice = parseFloat(card.getAttribute('data-price'));
            openQRModal();
        });
    });
    customScanBtn.addEventListener('click', () => {
        selectedMinutes = parseInt(customScanBtn.getAttribute('data-minutes'));
        selectedPrice = parseFloat(customScanBtn.getAttribute('data-price'));
        openQRModal();
    });

    // Open QR modal and reset form/section
    function openQRModal() {
        qrModal.style.display = 'block';
        userDetailsForm.style.display = '';
        qrSection.style.display = 'none';
        paymentSuccess.style.display = 'none';
        paidBtn.disabled = false;
        timerStarted = false;
        userName.value = '';
        userMobile.value = '';
        runInBackground = false;
        backgroundTimerToggle.checked = false;
        backgroundTimerToggle.onchange = (e) => {
            runInBackground = e.target.checked;
        };
    }

    // User details form submit
    userDetailsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (userName.value.trim() && /^\d{10}$/.test(userMobile.value.trim())) {
            userDetailsForm.style.display = 'none';
            qrSection.style.display = '';
            paymentSuccess.style.display = 'none';
            paidBtn.disabled = false;
        } else {
            alert('Please enter a valid name and 10-digit mobile number.');
        }
    });

    // Payment simulation logic
    paidBtn.addEventListener('click', () => {
        paidBtn.disabled = true;
        paymentSuccess.style.display = '';
        if (!timerStarted) {
            timerStarted = true;
            setTimeout(() => {
                qrModal.style.display = 'none';
                alert(`Charging started for ${userMobile.value.trim()}`);
                startChargingTimer(selectedMinutes * 60);
            }, 5000); // Wait 5 seconds before starting timer
        }
    });

    closeModal.addEventListener('click', () => {
        qrModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === qrModal) {
            qrModal.style.display = 'none';
        }
    });

    // Minimize timer logic
    minimizeTimerBtn.addEventListener('click', () => {
        timerScreen.style.display = 'none';
        runInBackground = true;
        saveTimerToStorage();
    });

    // Timer logic
    function startChargingTimer(duration) {
        remainingTime = duration;
        timerScreen.style.display = 'block';
        updateTimerDisplay();
        saveTimerToStorage();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            remainingTime--;
            updateTimerDisplay();
            saveTimerToStorage();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                clearTimerFromStorage();
                setTimeout(() => {
                    timerScreen.style.display = 'none';
                    alert('🔌 Charging Ended. Thank You!');
                }, 1000);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;
        timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Timer in background logic
    function saveTimerToStorage() {
        if (runInBackground) {
            localStorage.setItem('chargingTimer', JSON.stringify({
                end: Date.now() + remainingTime * 1000
            }));
        } else {
            localStorage.removeItem('chargingTimer');
        }
    }
    function clearTimerFromStorage() {
        localStorage.removeItem('chargingTimer');
    }
    // On page load, check if timer is running in background
    function checkBackgroundTimer() {
        const data = localStorage.getItem('chargingTimer');
        if (data) {
            const { end } = JSON.parse(data);
            const now = Date.now();
            if (end > now) {
                remainingTime = Math.floor((end - now) / 1000);
                timerScreen.style.display = 'block';
                updateTimerDisplay();
                if (timerInterval) clearInterval(timerInterval);
                timerInterval = setInterval(() => {
                    remainingTime--;
                    updateTimerDisplay();
                    saveTimerToStorage();
                    if (remainingTime <= 0) {
                        clearInterval(timerInterval);
                        clearTimerFromStorage();
                        setTimeout(() => {
                            timerScreen.style.display = 'none';
                            alert('🔌 Charging Ended. Thank You!');
                        }, 1000);
                    }
                }, 1000);
            } else {
                clearTimerFromStorage();
            }
        }
    }
    checkBackgroundTimer();

    // Add parallax effect to background
    window.addEventListener('scroll', () => {
        const parallaxBg = document.querySelector('.parallax-bg');
        const scrolled = window.pageYOffset;
        parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.card, .payment-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });
}); 