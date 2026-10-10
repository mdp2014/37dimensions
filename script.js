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
  const errorBox = document.getElementById('form-error');
  const mailFallbackBtn = document.getElementById('mail-fallback-btn');
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

  form.addEventListener('submit', async (e) => {
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

    if (errorBox) errorBox.setAttribute('hidden', '');

    // Récupération des cases cochées
    const selectedInterests = Array.from(
      form.querySelectorAll('input[name="interets"]:checked')
    ).map(cb => cb.value);

    const profilLabel = profil.options[profil.selectedIndex] ? profil.options[profil.selectedIndex].text : profil.value;
    const prenomVal = prenom.value.trim();
    const nomVal = nom.value.trim();
    const emailVal = email.value.trim();
    const telVal = form.querySelector('#telephone').value.trim() || 'Non renseigné';
    const interetsVal = selectedInterests.length > 0 ? selectedInterests.join(', ') : 'Aucun sélectionné';
    const messageVal = form.querySelector('#message').value.trim() || '(Aucun message)';

    const payload = {
      prenom: prenomVal,
      nom: nomVal,
      email: emailVal,
      telephone: telVal,
      profil: profilLabel,
      interets: interetsVal,
      message: messageVal,
      _subject: `[37dimensions] Inscription / Message de ${prenomVal} ${nomVal}`,
      _replyto: emailVal,
      _captcha: "false",
      _template: "table"
    };

    // Bouton en état de chargement
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const response = await fetch('https://formsubmit.co/ajax/marin.depibrac@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && (data.success === 'true' || data.success === true)) {
        // Sauvegarde de secours en localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('37dimensions_inscriptions') || '[]');
          stored.push({ ...payload, date: new Date().toISOString() });
          localStorage.setItem('37dimensions_inscriptions', JSON.stringify(stored));
        } catch (storageErr) {
          console.warn('LocalStorage non disponible:', storageErr);
        }

        // Affichage du message de confirmation
        form.style.display = 'none';
        successBox.removeAttribute('hidden');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        throw new Error(data.message || 'Erreur lors de la transmission du message.');
      }
    } catch (err) {
      console.error('Erreur FormSubmit:', err);

      // Préparation du lien mailto de secours
      if (mailFallbackBtn) {
        const mailtoSub = encodeURIComponent(`[37dimensions] Inscription de ${prenomVal} ${nomVal}`);
        const mailtoBody = encodeURIComponent(
          `Bonjour Marin,\n\nVoici ma demande pour l'association 37dimensions :\n\n- Nom : ${nomVal}\n- Prénom : ${prenomVal}\n- Email : ${emailVal}\n- Téléphone : ${telVal}\n- Profil : ${profilLabel}\n- Centres d'intérêt : ${interetsVal}\n\nMessage :\n${messageVal}\n`
        );
        mailFallbackBtn.href = `mailto:marin.depibrac@gmail.com?subject=${mailtoSub}&body=${mailtoBody}`;
      }

      if (errorBox) {
        errorBox.removeAttribute('hidden');
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'flex';
      if (errorBox) errorBox.setAttribute('hidden', '');
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
