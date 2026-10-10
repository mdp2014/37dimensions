/**
 * 37dimensions · Rochecorbon — Interactions & Dynamique du site
 * JavaScript moderne, accessible et sans dépendances superflues
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initActiveNavObserver();
  initContactForm();
  initBackToTop();
  initMentionsModal();
  initBadgeInteractions();
});

/**
 * 1. Menu Mobile (Drawer & Accessibilité ARIA)
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-footer a');

  if (!menuToggle || !mobileNav) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
    mobileNav.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', () => toggleMenu());

  // Fermer le menu lors du clic sur un lien
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Fermer avec la touche Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      toggleMenu(false);
      menuToggle.focus();
    }
  });
}

/**
 * 2. Suivi de la section active lors du défilement (IntersectionObserver)
 */
function initActiveNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');

  if (!sections.length || !desktopLinks.length || !('IntersectionObserver' in window)) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        desktopLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * 3. Validation & Soumission du Formulaire de Contact / Inscription
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successBox = document.getElementById('form-success');
  const resetBtn = document.getElementById('btn-reset-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !successBox) return;

  // Règles de validation simples
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkField = (input, errorId, isValid) => {
    const errorEl = document.getElementById(errorId);
    if (!isValid) {
      input.classList.add('is-invalid');
      if (errorEl) errorEl.classList.add('visible');
      return false;
    } else {
      input.classList.remove('is-invalid');
      if (errorEl) errorEl.classList.remove('visible');
      return true;
    }
  };

  // Suppression des messages d'erreur lors de la saisie
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const err = input.parentElement.querySelector('.error-msg');
      if (err) err.classList.remove('visible');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const prenom = form.querySelector('#prenom');
    const nom = form.querySelector('#nom');
    const email = form.querySelector('#email');
    const profil = form.querySelector('#profil');

    let valid = true;

    if (!checkField(prenom, 'error-prenom', prenom.value.trim().length > 0)) valid = false;
    if (!checkField(nom, 'error-nom', nom.value.trim().length > 0)) valid = false;
    if (!checkField(email, 'error-email', validateEmail(email.value.trim()))) valid = false;
    if (!checkField(profil, 'error-profil', profil.value !== '')) valid = false;

    if (!valid) {
      // Focus sur le premier champ invalide
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Récupération des cases cochées
    const selectedInterests = Array.from(
      form.querySelectorAll('input[name="interets"]:checked')
    ).map(cb => cb.value);

    const formData = {
      prenom: prenom.value.trim(),
      nom: nom.value.trim(),
      email: email.value.trim(),
      telephone: form.querySelector('#telephone').value.trim(),
      profil: profil.value,
      interets: selectedInterests,
      message: form.querySelector('#message').value.trim(),
      date: new Date().toISOString()
    };

    // Simulation de chargement asynchrone
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      // Enregistrement de pré-adhésion dans le localStorage pour persistance locale
      try {
        const stored = JSON.parse(localStorage.getItem('37dimensions_inscriptions') || '[]');
        stored.push(formData);
        localStorage.setItem('37dimensions_inscriptions', JSON.stringify(stored));
      } catch (err) {
        console.warn('LocalStorage non disponible:', err);
      }

      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Affichage du message de confirmation
      form.style.display = 'none';
      successBox.removeAttribute('hidden');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 700);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'flex';
      successBox.setAttribute('hidden', '');
      form.querySelector('#prenom').focus();
    });
  }
}

/**
 * 4. Bouton Retour en Haut
 */
function initBackToTop() {
  const backToTop = document.getElementById('back-to-top');
  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 5. Fenêtre Modale Mentions Légales
 */
function initMentionsModal() {
  const modal = document.getElementById('modal-mentions');
  const openBtn = document.getElementById('open-mentions');
  const closeBtn = document.getElementById('modal-close');
  const backdrop = document.getElementById('modal-backdrop');

  if (!modal || !openBtn) return;

  const openModal = () => {
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = () => {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    openBtn.focus();
  };

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });
}

/**
 * 6. Micro-interaction sur les badges du Hero
 * Permet de faire défiler vers la section Activités et pré-sélectionner l'intérêt dans le formulaire
 */
function initBadgeInteractions() {
  const heroBadges = document.querySelectorAll('.hero-badges .badge');
  heroBadges.forEach(badge => {
    badge.style.cursor = 'pointer';
    badge.addEventListener('click', () => {
      const activitesSection = document.getElementById('activites');
      if (activitesSection) {
        activitesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
