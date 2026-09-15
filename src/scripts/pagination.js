/* Lightweight page routing for the Wedding Essential demonstration site. */

const SITE_PAGES = {
  essential: [
    { id: 'home', label: 'Home', sections: ['top'] },
    { id: 'story', label: 'Our Story', sections: ['story'] },
    { id: 'details', label: 'Wedding Day', sections: ['details'] },
    { id: 'gallery', label: 'Photography', sections: ['gallery'] },
    { id: 'info', label: 'Good to Know', sections: ['info'] },
    { id: 'contact', label: 'Contact', sections: ['contact'] }
  ]
};

function initPagination() {
  const siteKey = document.body.dataset.paginationSite;
  const config = SITE_PAGES[siteKey];
  const main = document.querySelector('main');
  if (!config || !main) return;

  const sections = Array.from(main.querySelectorAll('section[id]'));
  const sectionToPage = new Map();
  const pages = config.map(page => {
    page.sections.forEach(sectionId => sectionToPage.set(sectionId, page.id));
    return page;
  });
  const pagesById = new Map(pages.map(page => [page.id, page]));

  // Keep any newly added section reachable without silently leaving it on every page.
  sections.forEach(section => {
    if (!sectionToPage.has(section.id)) {
      const page = { id: section.id, label: section.querySelector('h1, h2')?.textContent?.trim() || section.id, sections: [section.id] };
      pages.push(page);
      pagesById.set(page.id, page);
      sectionToPage.set(section.id, page.id);
    }
  });

  main.classList.add('paged-content');
  main.setAttribute('tabindex', '-1');

  const pageNav = document.createElement('nav');
  pageNav.className = 'demo-page-nav';
  pageNav.setAttribute('aria-label', 'Wedding site pages');
  pageNav.innerHTML = `
    <div class="demo-page-nav-inner">
      <div class="demo-page-nav-header">
        <span class="demo-page-nav-label">Explore this wedding site</span>
        <span class="demo-page-status" aria-live="polite"></span>
      </div>
      <div class="demo-page-links"></div>
    </div>`;
  main.prepend(pageNav);

  const pageLinks = pageNav.querySelector('.demo-page-links');
  pages.forEach(page => {
    const link = document.createElement('a');
    link.className = 'demo-page-link';
    link.dataset.pageLink = page.id;
    link.href = routeUrl(page.id);
    link.textContent = page.label;
    pageLinks.append(link);
  });

  const controls = document.createElement('nav');
  controls.className = 'demo-page-controls';
  controls.setAttribute('aria-label', 'Page controls');
  controls.innerHTML = `
    <a class="demo-page-control demo-page-control-prev" data-page-link="" href="#"></a>
    <a class="demo-page-control-home" data-page-link="home" href="${routeUrl('home')}">Site home</a>
    <a class="demo-page-control demo-page-control-next" data-page-link="" href="#"></a>`;
  main.append(controls);

  // Turn existing section links into page links while keeping external links untouched.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.dataset.pageLink) return;
    const rawTarget = anchor.getAttribute('href').slice(1);
    const pageId = rawTarget === '' || rawTarget === 'home' || rawTarget === 'hero' || rawTarget === 'top'
      ? 'home'
      : sectionToPage.get(rawTarget);
    if (pageId && pagesById.has(pageId)) {
      anchor.dataset.pageLink = pageId;
      anchor.setAttribute('href', routeUrl(pageId));
    }
  });

  function routeUrl(pageId) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageId);
    url.hash = '';
    return `${url.pathname}${url.search}`;
  }

  function pageFromLocation() {
    const url = new URL(window.location.href);
    const queryPage = url.searchParams.get('page');
    if (queryPage && pagesById.has(queryPage)) return queryPage;
    const hashPage = sectionToPage.get(url.hash.replace(/^#/, ''));
    return hashPage && pagesById.has(hashPage) ? hashPage : 'home';
  }

  function renderPage(pageId, { updateUrl = false, focus = false } = {}) {
    const page = pagesById.get(pageId) || pagesById.get('home');
    const pageIndex = pages.indexOf(page);
    sections.forEach(section => {
      const active = page.sections.includes(section.id);
      section.hidden = !active;
      if (active) section.removeAttribute('aria-hidden');
      else section.setAttribute('aria-hidden', 'true');
    });

    pageNav.querySelectorAll('.demo-page-link').forEach(link => {
      const active = link.dataset.pageLink === page.id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const status = pageNav.querySelector('.demo-page-status');
    if (status) status.textContent = `Page ${pageIndex + 1} of ${pages.length}`;

    const prev = controls.querySelector('.demo-page-control-prev');
    const next = controls.querySelector('.demo-page-control-next');
    const previousPage = pages[pageIndex - 1];
    const nextPage = pages[pageIndex + 1];
    if (previousPage) {
      prev.hidden = false;
      prev.dataset.pageLink = previousPage.id;
      prev.href = routeUrl(previousPage.id);
      prev.textContent = `← ${previousPage.label}`;
    } else {
      prev.hidden = true;
    }
    if (nextPage) {
      next.hidden = false;
      next.dataset.pageLink = nextPage.id;
      next.href = routeUrl(nextPage.id);
      next.textContent = `${nextPage.label} →`;
    } else {
      next.hidden = true;
    }

    document.body.classList.add('is-paged');
    if (updateUrl) window.history.pushState({}, '', routeUrl(page.id));
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (focus) main.focus({ preventScroll: true });
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-page-link]');
    if (!link || (event.button !== undefined && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const pageId = link.dataset.pageLink;
    if (!pagesById.has(pageId)) return;
    event.preventDefault();
    renderPage(pageId, { updateUrl: true, focus: true });
  });

  window.addEventListener('popstate', () => renderPage(pageFromLocation()));
  const initialPage = pageFromLocation();
  renderPage(initialPage);
  if (!new URL(window.location.href).searchParams.has('page')) {
    window.history.replaceState({}, '', routeUrl(initialPage));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPagination, { once: true });
} else {
  initPagination();
}
