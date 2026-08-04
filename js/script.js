/* ==========================
   HERO SLIDER
========================== */

const slides = document.querySelectorAll(".slide");

let current = 0;

function nextSlide() {
    slides[current].classList.remove("active");

    current++;

    if (current >= slides.length) {
        current = 0;
    }

    slides[current].classList.add("active");
}

if (slides.length > 0) {
    setInterval(nextSlide, 5000);
}


/* ==========================
   SCROLL REVEAL
========================== */

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.classList.add("active");
            revealObserver.unobserve(entry.target);

        }

    });

}, {
    threshold: 0.15
});

revealElements.forEach((section) => {
    revealObserver.observe(section);
});


/* ==========================
   PRODUCT SEARCH
========================== */

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    const products = document.querySelectorAll(".product-card");

    searchInput.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        products.forEach(product => {

            const text = product.innerText.toLowerCase();

            product.style.display = text.includes(value)
                ? "block"
                : "none";

        });

    });

}


/* ==========================
   COMPANY STATISTICS COUNTER
========================== */

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.target);

        let count = 0;
        const speed = target / 150;

        function updateCounter() {

            if (count < target) {

                count += speed;

                counter.innerText = Math.ceil(count).toLocaleString();

                requestAnimationFrame(updateCounter);

            } else {

                counter.innerText = target.toLocaleString() + "+";

            }

        }

        updateCounter();

        counterObserver.unobserve(counter);

    });

}, {
    threshold: 0.5
});

counters.forEach(counter => {
    counterObserver.observe(counter);
});
