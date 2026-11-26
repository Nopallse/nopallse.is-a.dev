const fallbackData = window.portfolioData;

const workCanvas = document.querySelector('[data-work-canvas]');
const cursorPreview = document.querySelector('[data-cursor-preview]');
const projectSummary = document.querySelector('[data-project-summary]');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const capabilityList = document.querySelector('[data-capability-list]');
const skillsList = document.querySelector('[data-skills-list]');
const timelineList = document.querySelector('[data-timeline-list]');
const educationList = document.querySelector('[data-education-list]');
const certificateList = document.querySelector('[data-certificate-list]');
const certificatesToggle = document.querySelector('[data-certificates-toggle]');
const profilePhotoWrap = document.querySelector('[data-profile-photo-wrap]');
const contactLink = document.querySelector('.contact-link');
const copyEmailBtn = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('[data-copy-status]');
const contactSocials = document.querySelector('[data-contact-socials]');
const contactLocation = document.querySelector('[data-contact-location]');
const cvLinks = [...document.querySelectorAll('[data-cv-link]')];
const githubLinks = [...document.querySelectorAll('[data-github-link]')];
const linkedinLinks = [...document.querySelectorAll('[data-linkedin-link]')];

const modal = document.querySelector('[data-project-modal]');
const modalClose = document.querySelector('[data-modal-close]');
const modalMeta = document.querySelector('[data-modal-meta]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalLead = document.querySelector('[data-modal-lead]');
const modalActions = document.querySelector('[data-modal-actions]');
const modalGallery = document.querySelector('[data-modal-gallery]');
const modalDescription = document.querySelector('[data-modal-description]');
const modalFeaturesWrap = document.querySelector('[data-modal-features-wrap]');
const modalFeatures = document.querySelector('[data-modal-features]');
const modalStackWrap = document.querySelector('[data-modal-stack-wrap]');
const modalStack = document.querySelector('[data-modal-stack]');

let activePortfolio = fallbackData;
let activeFilter = 'all';
let showAllCertificates = false;
let lastModalTrigger = null;

const normalizeCopy = (value = '') => {
  const fixed = String(value)
    .replace(/\bap\s+asaja\b/gi, 'apa saja')
    .replace(/\bdotnet\b/gi, '.NET')
    .trim();
  return fixed ? fixed.charAt(0).toUpperCase() + fixed.slice(1) : '';
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}[character]));

const safeHttpUrl = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-') return fallback;
  try {
    const url = new URL(trimmed);
    return /^https?:$/.test(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
};

const sanitizeRepoUrl = (value) => {
  const safe = safeHttpUrl(value, '');
  if (!safe) return '';
  return safe.replace(/\.git$/i, '');
};

const isPlaceholderDemoUrl = (url, repoUrl) => {
  if (!url) return true;
  if (repoUrl && sanitizeRepoUrl(url) === repoUrl) return true;
  return /github\.com\/.+\.git$/i.test(url)
    || /ecommerce-demo\.vercel\.app/i.test(url)
    || /weather-app-demo\.vercel\.app/i.test(url);
};

const inferCategory = (project) => {
  const stackText = Array.isArray(project.techStack) ? project.techStack.join(' ').toLowerCase() : '';
  const platformText = String(project.type || project.platform || '').toLowerCase();
  if (/(react|next\.js|vite|tailwind|vue|angular|web)/i.test(stackText) && !/(flutter|kotlin|jetpack|android)/i.test(stackText)) {
    return 'web';
  }
  if (/web/i.test(platformText)) return 'web';
  return 'mobile';
};

const renderProjectScene = (project) => `
  <div class="project-scene" role="img" aria-label="${escapeHtml(project.alt || project.title)}">
    <span class="scene-shadow"></span>
    <span class="scene-plane"></span>
    <span class="scene-display"><i></i><i></i><i></i></span>
    <span class="scene-block scene-block--one"></span>
    <span class="scene-block scene-block--two"></span>
    <span class="scene-orbit"></span>
  </div>
`;

const getCompanyInitials = (location = '', title = '') => {
  const source = String(location || title)
    .replace(/PT\.?|Tbk\.?|Persero|\(|\)/gi, ' ')
    .trim();
  const words = source.split(/\s+/).filter(Boolean);
  if (!words.length) return 'XP';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const bindMediaFallbacks = (projects) => {
  workCanvas?.querySelectorAll('.project-image').forEach((image) => {
    image.addEventListener('error', () => {
      const index = Number(image.dataset.projectIndex);
      const project = projects[index];
      if (!project) return;
      image.outerHTML = renderProjectScene(project);
    }, { once: true });
  });

  timelineList.querySelectorAll('.timeline-logo').forEach((logo) => {
    logo.addEventListener('error', () => {
      const initials = logo.dataset.initials || 'XP';
      logo.outerHTML = `<span class="timeline-initials">${escapeHtml(initials)}</span>`;
    }, { once: true });
  });
};

let observeReveal = () => {};
let revealVisibleElements = () => {};
let bindPointerLinks = () => {};
let cursorPreviewCleanup = null;

const getFilteredProjects = (projects) => (
  activeFilter === 'all' ? projects : projects.filter((project) => project.category === activeFilter)
);

const renderProjectMedia = (project, originalIndex) => {
  const imageUrl = safeHttpUrl(project.image, '');
  return imageUrl
    ? `<img class="project-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(project.alt)}" loading="lazy" decoding="async" data-project-index="${originalIndex}" />`
    : renderProjectScene(project);
};

const setupCursorPreview = (filtered, projects) => {
  if (cursorPreviewCleanup) {
    cursorPreviewCleanup();
    cursorPreviewCleanup = null;
  }
  if (!cursorPreview) return;
  cursorPreview.classList.remove('is-visible');
  cursorPreview.innerHTML = '';

  const list = workCanvas?.querySelector('.work-index-list');
  if (!list || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let currentScale = 0.86;
  let targetScale = 0.86;
  let isActive = false;
  let rafId = 0;

  const tick = () => {
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    currentX += dx * 0.18;
    currentY += dy * 0.18;
    currentScale += (targetScale - currentScale) * 0.16;
    const tilt = Math.max(-7, Math.min(7, dx * 0.18));
    cursorPreview.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${tilt.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;

    if (isActive || Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      rafId = 0;
    }
  };

  const ensureLoop = () => {
    if (!rafId) rafId = window.requestAnimationFrame(tick);
  };

  const positionFromEvent = (event) => {
    const previewW = cursorPreview.offsetWidth || 240;
    const previewH = cursorPreview.offsetHeight || 240;
    targetX = Math.min(window.innerWidth - previewW - 24, Math.max(16, event.clientX + 28));
    targetY = Math.min(window.innerHeight - previewH - 24, Math.max(16, event.clientY - previewH * 0.5));
    if (!isActive) {
      currentX = targetX;
      currentY = targetY;
    }
  };

  const onPointerMove = (event) => {
    if (window.innerWidth <= 960) return;
    positionFromEvent(event);
    ensureLoop();
  };

  const rows = [...list.querySelectorAll('.work-index-row')];
  const rowEnterHandlers = rows.map((row) => {
    const handler = (event) => {
      if (window.innerWidth <= 960) return;
      const idx = Number(row.dataset.indexPos);
      const project = filtered[idx];
      if (!project) return;
      const originalIndex = projects.indexOf(project);
      cursorPreview.innerHTML = `
        ${renderProjectMedia(project, originalIndex)}
        <span class="work-cursor-badge">${escapeHtml(project.number)}</span>
      `;
      const previewImg = cursorPreview.querySelector('.project-image');
      previewImg?.addEventListener('error', () => {
        previewImg.outerHTML = renderProjectScene(project);
      }, { once: true });
      list.classList.add('has-hover');
      rows.forEach((r) => r.closest('.work-index-item')?.classList.toggle('is-hovered', r === row));
      positionFromEvent(event);
      isActive = true;
      targetScale = 1;
      cursorPreview.classList.add('is-visible');
      ensureLoop();
    };
    row.addEventListener('pointerenter', handler);
    return { row, handler };
  });

  const onListLeave = () => {
    isActive = false;
    targetScale = 0.86;
    list.classList.remove('has-hover');
    rows.forEach((r) => r.closest('.work-index-item')?.classList.remove('is-hovered'));
    cursorPreview.classList.remove('is-visible');
    ensureLoop();
  };

  list.addEventListener('pointermove', onPointerMove);
  list.addEventListener('pointerleave', onListLeave);

  cursorPreviewCleanup = () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    list.removeEventListener('pointermove', onPointerMove);
    list.removeEventListener('pointerleave', onListLeave);
    rowEnterHandlers.forEach(({ row, handler }) => row.removeEventListener('pointerenter', handler));
    cursorPreview.classList.remove('is-visible');
  };
};

const renderProjects = (projects) => {
  const counts = {
    all: projects.length,
    web: projects.filter((p) => p.category === 'web').length,
    mobile: projects.filter((p) => p.category === 'mobile').length
  };

  filterButtons.forEach((button) => {
    const key = button.dataset.filter;
    const active = key === activeFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
    const countSpan = button.querySelector('[data-filter-count]');
    if (countSpan) countSpan.textContent = `(${counts[key] ?? 0})`;
  });

  const filtered = getFilteredProjects(projects);

  if (projectSummary) {
    projectSummary.textContent = `Showing ${filtered.length} of ${projects.length} projects`;
  }

  workCanvas.innerHTML = `
    <ul class="work-index-list">
      ${filtered.map((project, idx) => {
        const originalIndex = projects.indexOf(project);
        const stackPreview = Array.isArray(project.techStack) ? project.techStack.slice(0, 3).join(' · ') : '';
        return `
      <li class="work-index-item">
        <button class="work-index-row" type="button" data-project-open="${originalIndex}" data-index-pos="${idx}" aria-label="Open ${escapeHtml(project.title)} case study">
          <div class="work-index-meta">
            <span class="work-index-num">${escapeHtml(project.number)}</span>
            <span class="work-index-type">${escapeHtml(project.type)}</span>
          </div>
          <div class="work-index-main">
            <div class="work-index-thumb">${renderProjectMedia(project, originalIndex)}</div>
            <div>
              <h3 class="work-index-title">${escapeHtml(project.title)}</h3>
              <p class="work-index-desc">${escapeHtml(project.description)}</p>
            </div>
          </div>
          <p class="work-index-stack">${escapeHtml(stackPreview)}</p>
          <span class="work-index-arrow" aria-hidden="true">↗</span>
        </button>
      </li>
    `;
      }).join('')}
    </ul>
  `;

  setupCursorPreview(filtered, projects);
  bindMediaFallbacks(projects);
  observeReveal([...workCanvas.querySelectorAll('.work-index-item')]);
  revealVisibleElements();
  bindPointerLinks();
};

const renderCertificates = (certificates) => {
  if (!certificateList) return;
  const visibleLimit = 4;
  const hasMore = certificates.length > visibleLimit;
  const items = showAllCertificates ? certificates : certificates.slice(0, visibleLimit);

  if (certificatesToggle) {
    certificatesToggle.hidden = !hasMore;
    certificatesToggle.textContent = showAllCertificates ? 'Show fewer' : `Show all (${certificates.length})`;
  }

  certificateList.innerHTML = items.map((cert, idx) => {
    const link = safeHttpUrl(cert.credentialLink || cert.credential_link, '');
    const imageUrl = safeHttpUrl(cert.image, '');
    return `
  <li class="certificate-item">
    <div>
      <p class="certificate-title">${escapeHtml(cert.title)}</p>
      <p class="certificate-issuer">${escapeHtml(cert.issuer)}</p>
    </div>
    <div class="certificate-actions">
      ${imageUrl ? `<button class="certificate-preview" type="button" data-cert-preview="${idx}">Preview</button>` : ''}
      ${link ? `<a class="certificate-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Credential ↗</a>` : ''}
    </div>
  </li>
`;
  }).join('');
};

const renderPortfolio = (data) => {
  activePortfolio = data;
  renderProjects(data.projects);

  capabilityList.innerHTML = data.capabilities.map((item) => `
  <article class="capability">
    <p class="capability-index">${escapeHtml(item.index)}</p>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.body)}</p>
  </article>
`).join('');

  if (skillsList && Array.isArray(data.skills)) {
    skillsList.innerHTML = data.skills.map((group) => `
  <article class="stack-card">
    <h4>${escapeHtml(group.category)}</h4>
    <ul class="stack-list">
      ${(group.items || []).map((skill) => `<li>${escapeHtml(skill)}</li>`).join('')}
    </ul>
  </article>
`).join('');
  }

  timelineList.innerHTML = data.timeline.map((item, index) => {
    const number = item.number || String(index + 1).padStart(2, '0');
    const isCurrent = /\b(present|now|sekarang)\b/i.test(item.date || '');
    const logoUrl = safeHttpUrl(item.image, '');
    const initials = getCompanyInitials(item.location, item.title);

    return `
  <li class="timeline-item${isCurrent ? ' is-current' : ''}">
    <div class="timeline-meta">
      <span class="timeline-index">${escapeHtml(number)}</span>
      <p class="timeline-date">${escapeHtml(item.date)}</p>
      ${isCurrent ? '<span class="timeline-status">Current</span>' : ''}
    </div>
    <div class="timeline-role">
      <div class="timeline-mark" aria-hidden="true">
        ${logoUrl
          ? `<img class="timeline-logo" src="${escapeHtml(logoUrl)}" alt="" loading="lazy" decoding="async" data-initials="${escapeHtml(initials)}" />`
          : `<span class="timeline-initials">${escapeHtml(initials)}</span>`}
      </div>
      <div class="timeline-heading">
        ${item.location ? `<p class="timeline-org">${escapeHtml(item.location)}</p>` : ''}
        <h3>${escapeHtml(item.title)}</h3>
      </div>
    </div>
    <p class="timeline-desc">${escapeHtml(item.text)}</p>
  </li>
`;
  }).join('');

  if (educationList && Array.isArray(data.education)) {
    educationList.innerHTML = data.education.map((edu) => {
      const logoUrl = safeHttpUrl(edu.image, '');
      const initials = getCompanyInitials(edu.institution, edu.degree);
      return `
  <article class="education-card">
    <div class="education-mark" aria-hidden="true">
      ${logoUrl
        ? `<img src="${escapeHtml(logoUrl)}" alt="" loading="lazy" decoding="async" />`
        : `<span class="timeline-initials">${escapeHtml(initials)}</span>`}
    </div>
    <div>
      <h3>${escapeHtml(edu.degree)}</h3>
      <p class="education-meta">${escapeHtml(edu.institution)} · ${escapeHtml(edu.dateRange || edu.date_range || '')}</p>
      ${edu.location ? `<p class="education-meta">${escapeHtml(edu.location)}</p>` : ''}
    </div>
  </article>
`;
    }).join('');
  }

  renderCertificates(data.certificates || []);

  const contact = data.contact || fallbackData.contact;
  if (profilePhotoWrap) {
    const photoUrl = safeHttpUrl(contact?.photo, '');
    profilePhotoWrap.innerHTML = photoUrl
      ? `<figure class="profile-portrait"><img src="${escapeHtml(photoUrl)}" alt="Portrait of Naufal" loading="lazy" decoding="async" /></figure>`
      : '';
    const portraitImg = profilePhotoWrap.querySelector('img');
    portraitImg?.addEventListener('error', () => {
      profilePhotoWrap.innerHTML = '';
    }, { once: true });
  }

  const email = String(contact?.email || fallbackData.contact.email).trim();
  contactLink.href = `mailto:${encodeURIComponent(email)}`;
  contactLink.innerHTML = `${escapeHtml(email)} <span aria-hidden="true">↗</span>`;

  const githubUrl = safeHttpUrl(contact?.github, fallbackData.contact.github);
  const linkedinUrl = safeHttpUrl(contact?.linkedin, fallbackData.contact.linkedin);
  const cvUrl = contact?.cvUrl || fallbackData.contact.cvUrl;

  githubLinks.forEach((link) => { link.href = githubUrl; });
  linkedinLinks.forEach((link) => { link.href = linkedinUrl; });
  cvLinks.forEach((link) => { link.href = cvUrl; });

  if (contactLocation && contact?.location) {
    contactLocation.textContent = contact.location;
  }

  if (contactSocials) {
    const items = [
      githubUrl ? `<a href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : '',
      linkedinUrl ? `<a href="${escapeHtml(linkedinUrl)}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>` : ''
    ].filter(Boolean);
    contactSocials.innerHTML = items.join('');
  }

  bindMediaFallbacks(data.projects);
};

const openCaseStudyModal = (projectIndex, triggerElement = null) => {
  const project = activePortfolio.projects[projectIndex];
  if (!project || !modal) return;
  lastModalTrigger = triggerElement || document.activeElement;

  modalMeta.textContent = `${project.number} / ${project.type}`;
  modalTitle.textContent = project.fullTitle || project.title;
  modalLead.textContent = project.description;
  modalDescription.textContent = project.fullDescription || project.description;

  const repoUrl = sanitizeRepoUrl(project.repositoryLink);
  const rawDemoUrl = safeHttpUrl(project.demoLink, '');
  const demoUrl = isPlaceholderDemoUrl(rawDemoUrl, repoUrl) ? '' : rawDemoUrl;

  const actionLinks = [];
  if (demoUrl) {
    actionLinks.push(`<a class="action-button action-button--primary" href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer">Live Site ↗</a>`);
  }
  if (repoUrl) {
    actionLinks.push(`<a class="action-button${demoUrl ? '' : ' action-button--primary'}" href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer">Source Code ↗</a>`);
  }
  actionLinks.push('<a class="action-button" href="#contact" data-modal-contact>Discuss this project ↓</a>');
  modalActions.innerHTML = actionLinks.join('');

  const galleryImages = [...new Set([
    safeHttpUrl(project.image, ''),
    ...(Array.isArray(project.images) ? project.images.map((img) => safeHttpUrl(img, '')) : [])
  ].filter(Boolean))];

  if (galleryImages.length) {
    modalGallery.hidden = false;
    modalGallery.innerHTML = `
      <div class="case-modal__stage">
        <img src="${escapeHtml(galleryImages[0])}" alt="${escapeHtml(project.title)} preview" data-modal-stage-img />
      </div>
      ${galleryImages.length > 1 ? `
        <div class="case-modal__thumbs" role="group" aria-label="Project screenshots">
          ${galleryImages.map((src, idx) => `
            <button class="case-modal__thumb${idx === 0 ? ' is-active' : ''}" type="button" data-thumb-src="${escapeHtml(src)}" aria-label="View screenshot ${idx + 1}">
              <img src="${escapeHtml(src)}" alt="" loading="lazy" />
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;

    const stageImg = modalGallery.querySelector('[data-modal-stage-img]');
    const thumbs = [...modalGallery.querySelectorAll('.case-modal__thumb')];
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        if (!stageImg) return;
        stageImg.src = thumb.dataset.thumbSrc;
        thumbs.forEach((item) => item.classList.toggle('is-active', item === thumb));
      });
    });
  } else {
    modalGallery.hidden = true;
    modalGallery.innerHTML = '';
  }

  const features = Array.isArray(project.features) ? project.features.filter(Boolean) : [];
  modalFeaturesWrap.hidden = features.length === 0;
  modalFeatures.innerHTML = features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');
  if (modalDescription.parentElement) modalDescription.parentElement.hidden = false;

  const stack = Array.isArray(project.techStack) ? project.techStack.filter(Boolean) : [];
  modalStackWrap.hidden = stack.length === 0;
  modalStack.innerHTML = stack.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  document.body.classList.add('modal-is-open');
  modal.showModal();
  modalClose?.focus();
};

const openCertificateModal = (cert, triggerElement = null) => {
  if (!cert || !modal) return;
  lastModalTrigger = triggerElement || document.activeElement;
  const imageUrl = safeHttpUrl(cert.image, '');
  const credentialUrl = safeHttpUrl(cert.credentialLink || cert.credential_link, '');

  modalMeta.textContent = `Certificate / ${cert.issuer}`;
  modalTitle.textContent = cert.title;
  modalLead.textContent = `Issued by ${cert.issuer}`;
  modalActions.innerHTML = credentialUrl
    ? `<a class="action-button action-button--primary" href="${escapeHtml(credentialUrl)}" target="_blank" rel="noopener noreferrer">Verify Credential ↗</a>`
    : '';

  if (imageUrl) {
    modalGallery.hidden = false;
    modalGallery.innerHTML = `<div class="case-modal__stage"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(cert.title)} certificate" /></div>`;
  } else {
    modalGallery.hidden = true;
    modalGallery.innerHTML = '';
  }

  modalDescription.textContent = '';
  if (modalDescription.parentElement) modalDescription.parentElement.hidden = true;
  modalFeaturesWrap.hidden = true;
  modalFeatures.innerHTML = '';
  modalStackWrap.hidden = true;
  modalStack.innerHTML = '';

  document.body.classList.add('modal-is-open');
  modal.showModal();
  modalClose?.focus();
};

const closeCaseStudyModal = () => {
  if (!modal?.open) return;
  modal.close();
  document.body.classList.remove('modal-is-open');
  if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
    lastModalTrigger.focus();
  }
  lastModalTrigger = null;
};

workCanvas?.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-project-open]');
  if (!trigger) return;
  openCaseStudyModal(Number(trigger.dataset.projectOpen), trigger);
});

certificateList?.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-cert-preview]');
  if (!trigger) return;
  const certs = showAllCertificates
    ? (activePortfolio.certificates || [])
    : (activePortfolio.certificates || []).slice(0, 4);
  const cert = certs[Number(trigger.dataset.certPreview)];
  if (cert) openCertificateModal(cert, trigger);
});

modalClose?.addEventListener('click', closeCaseStudyModal);
modal?.addEventListener('click', (event) => {
  if (event.target === modal || event.target.closest('[data-modal-contact]')) {
    closeCaseStudyModal();
  }
});
modal?.addEventListener('close', () => {
  document.body.classList.remove('modal-is-open');
  if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
    lastModalTrigger.focus();
  }
  lastModalTrigger = null;
});

copyEmailBtn?.addEventListener('click', async () => {
  const email = (contactLink?.textContent || fallbackData.contact.email).replace('↗', '').trim();
  try {
    await navigator.clipboard.writeText(email);
    if (copyStatus) copyStatus.textContent = 'Copied to clipboard';
  } catch {
    if (copyStatus) copyStatus.textContent = email;
  }
  window.setTimeout(() => {
    if (copyStatus) copyStatus.textContent = '';
  }, 2400);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter || 'all';
    renderProjects(activePortfolio.projects);
  });
});

certificatesToggle?.addEventListener('click', () => {
  showAllCertificates = !showAllCertificates;
  renderCertificates(activePortfolio.certificates || []);
});

const mapSupabaseData = (payload) => {
  if (!Array.isArray(payload.projects) || !Array.isArray(payload.experience)) return fallbackData;

  const projects = payload.projects.length ? payload.projects.map((project, index) => {
    const rawTitle = String(project.title || '').trim();
    const shortTitle = rawTitle.replace(/\s*-\s*Premium Pilates Studio Management System$/i, '');
    const mapped = {
      number: String(index + 1).padStart(2, '0'),
      title: shortTitle,
      fullTitle: rawTitle,
      type: '',
      category: 'mobile',
      description: normalizeCopy(project.short_desc),
      fullDescription: normalizeCopy(project.full_desc || project.short_desc),
      image: project.cover_image,
      images: Array.isArray(project.images) ? project.images : [],
      features: Array.isArray(project.features) ? project.features : [],
      techStack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
      demoLink: project.demo_link,
      repositoryLink: project.repository_link,
      alt: `${shortTitle} project cover`,
      orientation: index % 2 ? 'portrait' : 'wide'
    };
    mapped.category = inferCategory(mapped);
    mapped.type = mapped.category === 'web' ? 'Web platform' : 'Mobile product';
    return mapped;
  }) : fallbackData.projects;

  const skills = Array.isArray(payload.skills) && payload.skills.length
    ? payload.skills.map((skill) => ({
      category: skill.category,
      items: Array.isArray(skill.items) ? skill.items : []
    }))
    : fallbackData.skills;

  const timeline = payload.experience.length ? payload.experience.map((experience, index) => ({
    number: String(index + 1).padStart(2, '0'),
    date: experience.date_range,
    title: experience.title,
    location: experience.location || '',
    image: experience.image || '',
    text: normalizeCopy(experience.description)
  })) : fallbackData.timeline;

  const education = Array.isArray(payload.education) && payload.education.length
    ? payload.education.map((edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      dateRange: edu.date_range,
      location: edu.location,
      image: edu.image
    }))
    : fallbackData.education;

  const certificates = Array.isArray(payload.certificates) && payload.certificates.length
    ? payload.certificates.map((cert) => ({
      title: cert.title,
      issuer: cert.issuer,
      image: cert.image || '',
      credentialLink: cert.credential_link || ''
    }))
    : fallbackData.certificates;

  const contactRecord = Array.isArray(payload.contact_info) ? payload.contact_info[0] : null;

  return {
    ...fallbackData,
    projects,
    capabilities: fallbackData.capabilities,
    skills,
    timeline,
    education,
    certificates,
    contact: contactRecord ? { ...fallbackData.contact, ...contactRecord } : fallbackData.contact
  };
};

renderPortfolio(fallbackData);

const toggle = document.querySelector('[data-menu-toggle]');
const menuLabel = document.querySelector('[data-menu-label]');
const menuSymbol = document.querySelector('[data-menu-symbol]');
const wordmark = document.querySelector('[data-wordmark]');
const navigation = document.querySelector('[data-navigation]');
const header = document.querySelector('[data-header]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const themeStorageKey = 'naufal-portfolio-theme';

const applyTheme = (theme, { persist = true } = {}) => {
  const activeTheme = theme === 'forest' ? 'forest' : 'monochrome';
  const forestIsActive = activeTheme === 'forest';
  document.documentElement.dataset.theme = activeTheme;
  themeToggle.setAttribute('aria-pressed', String(forestIsActive));
  themeToggle.setAttribute('aria-label', forestIsActive ? 'Switch to Day mode' : 'Switch to Night mode');
  themeLabel.textContent = forestIsActive ? 'Day' : 'Night';

  if (!persist) return;
  try {
    localStorage.setItem(themeStorageKey, activeTheme);
  } catch { /* Theme selection remains active for this visit. */ }
};

applyTheme(document.documentElement.dataset.theme, { persist: false });
themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'forest' ? 'monochrome' : 'forest');
  if (typeof updateHeaderAppearance === 'function') updateHeaderAppearance();
});

const setMenuState = (open, { returnFocus = false } = {}) => {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  if (menuLabel) menuLabel.textContent = open ? 'Close' : 'Menu';
  if (menuSymbol) menuSymbol.textContent = open ? '×' : '+';
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-is-open', open);
  if (!open && returnFocus) toggle.focus();
};

const closeNavigation = (options) => setMenuState(false, options);

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  setMenuState(!open);
});

wordmark?.addEventListener('click', () => {
  if (toggle.getAttribute('aria-expanded') === 'true') closeNavigation();
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  closeNavigation();
}));

window.addEventListener('resize', () => {
  if (window.innerWidth > 760 && toggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
  }
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation({ returnFocus: true });
  }
});

document.querySelector('[data-current-year]').textContent = new Date().getFullYear();

const setChapterAppearance = (chapter) => {
  if (!chapter) return;
  const inverted = chapter.classList.contains('section-dark')
    || (document.documentElement.dataset.theme === 'forest');
  header.classList.toggle('is-inverted', inverted);
};

const updateHeaderAppearance = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 32);
  const activeChapter = document.elementFromPoint(window.innerWidth / 2, Math.min(window.innerHeight * .12, 84))
    ?.closest('.hero, .section-light, .section-dark');
  setChapterAppearance(activeChapter);
};

const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const trackedSections = navLinks
  .map((link) => document.getElementById(link.dataset.navLink))
  .filter(Boolean);

const updateActiveNav = () => {
  const anchorY = window.scrollY + window.innerHeight * 0.3;
  let currentId = '';
  trackedSections.forEach((section) => {
    if (section.offsetTop <= anchorY) currentId = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.navLink === currentId);
  });
};

let headerFrameRequested = false;
const scheduleHeaderAppearance = () => {
  if (headerFrameRequested) return;
  headerFrameRequested = true;
  window.requestAnimationFrame(() => {
    updateHeaderAppearance();
    updateActiveNav();
    headerFrameRequested = false;
  });
};

window.addEventListener('scroll', scheduleHeaderAppearance, { passive: true });
window.addEventListener('resize', scheduleHeaderAppearance, { passive: true });
updateHeaderAppearance();
updateActiveNav();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

if (!reduceMotion) {
  document.documentElement.classList.add('motion-ready');
  const hero = document.querySelector('.hero');
  const heroTitle = document.querySelector('.hero h1');
  const heroObject = document.querySelector('.hero-object');
  const heroWords = [...document.querySelectorAll('.hero h1 span')];
  const statement = document.querySelector('.statement');
  const statementOrbit = document.querySelector('.statement-orbit');
  const timeline = document.querySelector('.timeline');
  const profile = document.querySelector('.profile');

  const trackedRevealElements = new Set();
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
        trackedRevealElements.delete(entry.target);
      }
    });
  }, { threshold: 0.03, rootMargin: '0px 0px -2% 0px' });

  observeReveal = (elements) => elements.filter(Boolean).forEach((element) => {
    if (element.classList.contains('is-revealed')) return;
    trackedRevealElements.add(element);
    revealObserver.observe(element);
  });

  revealVisibleElements = () => {
    const thresholdY = window.innerHeight * 0.98;
    trackedRevealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top <= thresholdY) {
        element.classList.add('is-revealed');
        revealObserver.unobserve(element);
        trackedRevealElements.delete(element);
      }
    });
  };

  observeReveal([
    statement,
    ...document.querySelectorAll('.section-heading, .timeline-intro'),
    ...document.querySelectorAll('.work-index-item'),
    ...document.querySelectorAll('.capability'),
    ...document.querySelectorAll('.timeline-item'),
    profile,
    document.querySelector('.contact')
  ]);
  revealVisibleElements();

  let frameRequested = false;
  const updateScrollMotion = () => {
    const y = window.scrollY;
    const viewport = window.innerHeight;
    if (hero && heroTitle && heroWords.length >= 2) {
      const heroProgress = clamp(y / Math.max(hero.offsetHeight * .82, 1));
      heroTitle.style.transform = `translate3d(0, ${heroProgress * -7}vh, 0) scale(${1 - heroProgress * .04})`;
      heroWords[0].style.transform = `translate3d(${heroProgress * -2.5}vw, 0, 0)`;
      heroWords[1].style.transform = `translate3d(${heroProgress * 3}vw, 0, 0)`;
      heroObject?.style.setProperty('--hero-object-shift', `${heroProgress * -6}vh`);
    }

    if (statement) {
      const statementProgress = clamp((y - statement.offsetTop + viewport) / (statement.offsetHeight + viewport));
      statementOrbit?.style.setProperty('--orbit-shift', `${(statementProgress - .5) * 10}vw`);
    }

    if (timeline) {
      const timelineStart = timeline.offsetTop - viewport * .62;
      const timelineRange = Math.max(timeline.offsetHeight + viewport * .3, 1);
      timeline.style.setProperty('--timeline-progress', clamp((y - timelineStart) / timelineRange));
    }

    if (profile) {
      const profileProgress = clamp((y - profile.offsetTop + viewport) / (profile.offsetHeight + viewport));
      profile.style.setProperty('--profile-shift', `${(profileProgress - .5) * 8}vw`);
    }

    revealVisibleElements();
    frameRequested = false;
  };

  window.addEventListener('scroll', () => {
    if (!frameRequested) {
      frameRequested = true;
      window.requestAnimationFrame(updateScrollMotion);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollMotion, { passive: true });
  updateScrollMotion();

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    bindPointerLinks = () => {
      document.querySelectorAll('.contact-link').forEach((link) => {
        if (link.dataset.pointerBound === 'true') return;
        link.dataset.pointerBound = 'true';
        link.addEventListener('pointermove', (event) => {
          const bounds = link.getBoundingClientRect();
          link.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 5}px`);
          link.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 5}px`);
        });
        link.addEventListener('pointerleave', () => {
          link.style.setProperty('--pointer-x', '0px');
          link.style.setProperty('--pointer-y', '0px');
        });
      });
    };
    bindPointerLinks();
  }
}

const loadSupabasePortfolio = async () => {
  try {
    const response = await fetch('/api/portfolio', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Portfolio request failed with ${response.status}.`);

    const portfolio = mapSupabaseData(await response.json());
    if (portfolio === fallbackData) return;
    renderPortfolio(portfolio);
    updateHeaderAppearance();
    observeReveal([...document.querySelectorAll('.work-index-item, .capability, .timeline-item')]);
    revealVisibleElements();
    bindPointerLinks();
  } catch (error) {
    console.info('Supabase portfolio data unavailable; displaying local fallback content.');
  }
};

loadSupabasePortfolio();
