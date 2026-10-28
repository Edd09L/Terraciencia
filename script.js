// =========================================================================
// TERRACIENCIA - INTERACTIVIDAD Y ANIMACIONES DINÁMICAS AL HACER SCROLL
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initMascotaHoverEffects();
    initLeadCaptureForm();
});

/**
 * ANIMACIÓN BIDIRECCIONAL AL HACER SCROLL
 * - Al bajar (Entrada): Los elementos aparecen suavemente desplazándose hacia arriba
 *   con efecto de aceleración y desvanecimiento (fade-in-up) y un leve resplandor neón.
 * - Al subir (Salida): Cuando los elementos salgan de la vista hacia la parte inferior
 *   al subir en la página, se desvanecen hacia abajo (fade-out-down) para volver a ocultarse.
 */
function initScrollAnimations() {
    const animElements = document.querySelectorAll('.animate-on-scroll');
    if (!animElements.length) return;

    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Inicializar elementos visibles inmediatamente al cargar
    function checkInitialVisibility() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        animElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh * 0.95 && rect.bottom > 0) {
                el.classList.add('scroll-in');
                el.classList.remove('scroll-out-down');
            }
        });
    }
    checkInitialVisibility();

    // IntersectionObserver para monitorear visibilidad y dirección
    const observer = new IntersectionObserver((entries) => {
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const vh = window.innerHeight || document.documentElement.clientHeight;

        entries.forEach(entry => {
            const el = entry.target;
            const rect = entry.boundingClientRect;

            if (entry.isIntersecting) {
                // Entrada: cuando el elemento ingresa a la vista al hacer scroll
                el.classList.remove('scroll-out-down');
                el.classList.add('scroll-in');
            } else {
                // Salida: si el elemento queda por debajo del viewport (al hacer scroll hacia arriba)
                if (rect.top >= vh * 0.85) {
                    el.classList.remove('scroll-in');
                    el.classList.add('scroll-out-down');
                }
            }
        });

        lastScrollY = currentScrollY;
    }, {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: [0, 0.15, 0.3]
    });

    animElements.forEach(el => observer.observe(el));

    // Scroll listener complementario de alta precisión para transiciones continuas
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
                const vh = window.innerHeight || document.documentElement.clientHeight;

                animElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    // Si el elemento está por debajo de la ventana (usuario subió el scroll)
                    if (rect.top > vh) {
                        if (el.classList.contains('scroll-in')) {
                            el.classList.remove('scroll-in');
                            el.classList.add('scroll-out-down');
                        }
                    } else if (rect.top < vh * 0.90 && rect.bottom > 0) {
                        // Si el elemento está en la ventana visible
                        if (!el.classList.contains('scroll-in')) {
                            el.classList.remove('scroll-out-down');
                            el.classList.add('scroll-in');
                        }
                    }
                });

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/**
 * Reactiva animaciones cuando el usuario cambia de sección (Inicio / Materiales)
 */
function refreshScrollAnimations() {
    setTimeout(() => {
        const activeSection = document.querySelector('.view-section.active');
        if (!activeSection) return;
        const animElements = activeSection.querySelectorAll('.animate-on-scroll');
        const vh = window.innerHeight || document.documentElement.clientHeight;

        animElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh * 0.92 && rect.bottom > 0) {
                el.classList.remove('scroll-out-down');
                el.classList.add('scroll-in');
            } else if (rect.top >= vh) {
                el.classList.remove('scroll-in');
                el.classList.add('scroll-out-down');
            }
        });
    }, 100);
}

/**
 * INTERACTIVIDAD HOVER EN MASCOTAS
 * Aplica elevación ligera e intensifica el brillo de su cápsula de nombre
 */
function initMascotaHoverEffects() {
    const interactiveItems = document.querySelectorAll('.mascota, .guia-card');
    interactiveItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const pill = item.querySelector('.mascota-nombre, .guia-nombre-pill');
            if (pill) {
                pill.classList.add('hover-glow-active');
            }
        });
        item.addEventListener('mouseleave', () => {
            const pill = item.querySelector('.mascota-nombre, .guia-nombre-pill');
            if (pill) {
                pill.classList.remove('hover-glow-active');
            }
        });
    });
}

/**
 * Navegación suave a la sección de Guías de Aprendizaje
 */
function scrollToGuias(evt) {
    if (evt) evt.preventDefault();
    showSection('inicio');
    setTimeout(() => {
        const guiasSec = document.getElementById('guias-aprendizaje');
        if (guiasSec) {
            guiasSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 120);
}

/**
 * Navegación suave a cualquier elemento por ID asegurando vista de Inicio activa
 */
function scrollToElement(elementId, evt) {
    if (evt) evt.preventDefault();
    if (typeof showSection === 'function') {
        showSection('inicio');
    }
    setTimeout(() => {
        const target = document.getElementById(elementId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 120);
}

/**
 * Inicialización del listener del formulario de captación
 */
function initLeadCaptureForm() {
    const form = document.getElementById('leadCaptureForm');
    if (form) {
        form.removeEventListener('submit', handleLeadCapture);
        form.addEventListener('submit', handleLeadCapture);
    }
}

/**
 * Gestión de la suscripción al boletín / captación de datos con Formspree
 */
async function handleLeadCapture(evt) {
    if (evt) evt.preventDefault();
    const form = document.getElementById('leadCaptureForm') || (evt && evt.target);
    const nameInput = document.querySelector('input[name="name"]') || document.getElementById('leadNameInput');
    const emailInput = document.querySelector('input[name="email"]') || document.getElementById('leadEmailInput');
    const feedbackEl = document.getElementById('captacionFeedback');
    const btnSubmit = document.getElementById('btnLeadSubmit');

    if (!emailInput || !emailInput.value) return;

    const nameValue = nameInput ? nameInput.value.trim() : '';
    const emailValue = emailInput.value.trim();
    if (!emailValue) return;

    // Estado visual de envío en el botón
    const originalBtnContent = '<span>📩 Recibir Novedades</span>';
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>⏳ Enviando...</span>';
        btnSubmit.style.opacity = '0.85';
    }

    try {
        const endpoint = (form && form.action) ? form.action : 'https://formspree.io/f/mjyybdaj';
        const payload = { email: emailValue };
        if (nameValue) {
            payload.name = nameValue;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Confirmación verde de éxito sin recargar la página
            if (btnSubmit) {
                btnSubmit.innerHTML = '<span>✓ ¡Suscrito con éxito!</span>';
                btnSubmit.style.background = 'linear-gradient(135deg, #00f0aa 0%, #25d366 100%)';
                btnSubmit.style.opacity = '1';
            }

            if (feedbackEl) {
                feedbackEl.style.display = 'inline-block';
                feedbackEl.className = 'captacion-feedback captacion-success';
                const saludoNombre = nameValue ? `, ${nameValue}` : '';
                feedbackEl.innerHTML = `🎉 <strong>¡Gracias por unirte${saludoNombre}!</strong> Hemos registrado tu correo <em>${emailValue}</em>. Recibirás antes que nadie las novedades del catálogo y recursos gratuitos.`;
            }

            if (form && typeof form.reset === 'function') {
                form.reset();
            } else {
                if (nameInput) nameInput.value = '';
                if (emailInput) emailInput.value = '';
            }

            setTimeout(() => {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalBtnContent;
                    btnSubmit.style.background = '';
                }
            }, 6000);
        } else {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Respuesta no satisfactoria del servidor');
        }
    } catch (err) {
        console.error('Error al registrar datos con Formspree:', err);
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalBtnContent;
            btnSubmit.style.opacity = '1';
        }
        if (feedbackEl) {
            feedbackEl.style.display = 'inline-block';
            feedbackEl.className = 'captacion-feedback captacion-error';
            feedbackEl.innerHTML = `⚠️ No fue posible registrar tu solicitud automáticamente. Por favor intenta de nuevo o escríbenos a <a href="mailto:terraciencia0@gmail.com" style="color: #00d2ff; text-decoration: underline;">terraciencia0@gmail.com</a>.`;
        }
    }
}