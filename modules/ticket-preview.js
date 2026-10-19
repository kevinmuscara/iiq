(function() {
  const splitViewId = 'iiq-ticket-split-view';
  const paneWidthProperty = '--iiq-ticket-pane-width';
  let pageLayoutBeforeSplit = null;
  let paneWidth = null;

  async function fetchAndRenderTicketForRow(row) {
    if (!row) return;

    const link = getRowLink(row);
    if (!link) {
      console.warn('iiq: no ticket link found for row');
      return;
    }

    openLinkInSplitView(link, link.title || link.text || 'Ticket Details');
  }

  function openLinkInSplitView(link, titleFallback) {
    if (!link || !link.href) return;
    const splitView = getOrCreateTicketSplitView();
    const iframe = splitView.querySelector('iframe');
    const titleEl = splitView.querySelector('[data-iiq-split-title]');

    const resolvedUrl = new URL(link.href, window.location.origin).toString();
    titleEl.textContent = titleFallback || 'Ticket Details';
    iframe.title = `${titleEl.textContent} preview`;
    iframe.onload = () => {
      setTimeout(() => {
        const sidebar = iframe.contentDocument.getElementsByTagName(`iq-navigation`)[0];
        if(!sidebar) {
          console.warn('iiq: sidebar not found in preview iframe');
          return;
        }

        sidebar.remove();
      }, 1000);
    };
    iframe.src = resolvedUrl;
    showTicketSplitView(splitView);
  }

  function getRowLink(row) {
    if (!row) return null;

    const directHref = row.getAttribute('href') || row.getAttribute('data-href');
    if (directHref) {
      return { href: directHref, text: 'Ticket Details' };
    }

    const anchor = row.querySelector('a[href]');
    if (!anchor) return null;

    const href = anchor.getAttribute('href') || anchor.href;
    if (!href || href === '#' || href.startsWith('javascript:')) return null;

    return {
      href,
      text: (anchor.textContent || '').trim(),
      title: (anchor.getAttribute('title') || '').trim()
    };
  }

  function getOrCreateTicketSplitView() {
    const existing = document.getElementById(splitViewId);
    if (existing) return existing;

    const splitView = document.createElement('aside');
    splitView.id = splitViewId;
    splitView.setAttribute('role', 'complementary');
    splitView.setAttribute('aria-label', 'Ticket preview');
    splitView.setAttribute('aria-hidden', 'true');
    splitView.style.cssText = 'position:fixed;top:0;right:0;width:50vw;height:100vh;height:100dvh;box-sizing:border-box;z-index:2147483646;display:none;flex-direction:column;background:#fff;border-left:1px solid rgba(0,114,201,0.22);box-shadow:-12px 0 36px rgba(3,26,56,0.16);font-family:Inter,Arial,Helvetica,sans-serif;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;box-sizing:border-box;padding:9px 14px;background:linear-gradient(90deg,#0072ce,#005bb5);color:#fff;font-size:13px;font-weight:600;';

    const title = document.createElement('div');
    title.setAttribute('data-iiq-split-title', '');
    title.textContent = 'Ticket Details';
    title.style.cssText = 'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.setAttribute('aria-label', 'Close ticket preview');
    close.style.cssText = 'flex:none;border:1px solid rgba(255,255,255,0.35);background:rgba(255,255,255,0.12);color:#fff;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;';
    close.addEventListener('click', () => hideTicketSplitView(splitView));

    header.appendChild(title);
    header.appendChild(close);

    const frame = document.createElement('iframe');
    frame.setAttribute('title', 'Ticket Details preview');
    frame.style.cssText = 'flex:1;min-height:0;border:none;width:100%;background:#fff;';

    const divider = document.createElement('div');
    divider.setAttribute('role', 'separator');
    divider.setAttribute('aria-orientation', 'vertical');
    divider.setAttribute('aria-label', 'Resize ticket preview');
    divider.setAttribute('tabindex', '0');
    divider.style.cssText = 'position:absolute;top:0;left:-5px;width:10px;height:100%;cursor:col-resize;touch-action:none;';
    divider.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      divider.setPointerCapture(event.pointerId);
    });
    divider.addEventListener('pointermove', (event) => {
      if (divider.hasPointerCapture(event.pointerId)) {
        setPaneWidth(window.innerWidth - event.clientX, splitView);
      }
    });
    divider.addEventListener('pointerup', (event) => {
      if (divider.hasPointerCapture(event.pointerId)) divider.releasePointerCapture(event.pointerId);
    });
    divider.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const adjustment = event.key === 'ArrowLeft' ? 24 : -24;
      setPaneWidth(paneWidth + adjustment, splitView);
    });

    splitView.appendChild(header);
    splitView.appendChild(frame);
    splitView.appendChild(divider);
    document.body.appendChild(splitView);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && splitView.style.display === 'flex') {
        hideTicketSplitView(splitView);
      }
    });
    window.addEventListener('resize', () => {
      if (splitView.style.display === 'flex' && paneWidth !== null) {
        setPaneWidth(paneWidth, splitView);
      }
    });

    return splitView;
  }

  function setPaneWidth(width, splitView) {
    const viewportWidth = window.innerWidth;
    const minWidth = Math.min(300, viewportWidth * 0.4);
    const maxWidth = Math.max(minWidth, Math.min(viewportWidth * 0.75, viewportWidth - 280));
    paneWidth = Math.max(minWidth, Math.min(width, maxWidth));
    splitView.style.width = `${paneWidth}px`;
    document.documentElement.style.setProperty(paneWidthProperty, `${paneWidth}px`);
    const divider = splitView.querySelector('[role="separator"]');
    if (divider) {
      divider.setAttribute('aria-valuemin', String(Math.round(minWidth)));
      divider.setAttribute('aria-valuemax', String(Math.round(maxWidth)));
      divider.setAttribute('aria-valuenow', String(Math.round(paneWidth)));
    }
    if (pageLayoutBeforeSplit) {
      document.body.style.setProperty('width', `calc(100% - var(${paneWidthProperty}))`, 'important');
    }
  }

  function showTicketSplitView(splitView) {
    if (!pageLayoutBeforeSplit) {
      pageLayoutBeforeSplit = {
        bodyStyles: ['width', 'box-sizing', 'margin-left', 'margin-right'].map(property => ({
          property,
          value: document.body.style.getPropertyValue(property),
          priority: document.body.style.getPropertyPriority(property)
        })),
        paneWidthValue: document.documentElement.style.getPropertyValue(paneWidthProperty),
        paneWidthPriority: document.documentElement.style.getPropertyPriority(paneWidthProperty)
      };
    }

    setPaneWidth(paneWidth === null ? window.innerWidth * 0.5 : paneWidth, splitView);
    document.body.style.setProperty('box-sizing', 'border-box', 'important');
    document.body.style.setProperty('width', `calc(100% - var(${paneWidthProperty}))`, 'important');
    document.body.style.setProperty('margin-left', '0', 'important');
    document.body.style.setProperty('margin-right', '0', 'important');
    splitView.style.display = 'flex';
    splitView.setAttribute('aria-hidden', 'false');
  }

  function hideTicketSplitView(splitView) {
    splitView.style.display = 'none';
    splitView.setAttribute('aria-hidden', 'true');

    if (!pageLayoutBeforeSplit) return;
    pageLayoutBeforeSplit.bodyStyles.forEach(({ property, value, priority }) => {
      if (value) {
        document.body.style.setProperty(property, value, priority);
      } else {
        document.body.style.removeProperty(property);
      }
    });
    if (pageLayoutBeforeSplit.paneWidthValue) {
      document.documentElement.style.setProperty(
        paneWidthProperty,
        pageLayoutBeforeSplit.paneWidthValue,
        pageLayoutBeforeSplit.paneWidthPriority
      );
    } else {
      document.documentElement.style.removeProperty(paneWidthProperty);
    }
    pageLayoutBeforeSplit = null;
  }

  function handleModifiedClickPreview(e) {
    if(settings.ticketPreviewEnabled) {
      if (!e.ctrlKey && !e.metaKey) return;
      const assetLink = getAssetOpenTicketsLink(e);
      if (assetLink) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        openLinkInSplitView(assetLink, 'Open Tickets');
        return;
      }
  
      const row = e.target && e.target.closest ? e.target.closest('spark-grid-row') : null;
      if (!row) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      fetchAndRenderTicketForRow(row).catch(err => console.warn('iiq: modified click failed', err));
    }

  }

  function getAssetOpenTicketsLink(event) {
    if (!isAssetDetailsPage()) return null;
    const container = document.querySelector('[ng-show1="$ctrl.Data.SummaryStats.OpenTickets > 0"]');
    if (!container) return null;
    if (!container.contains(event.target)) return null;

    const anchor = container.getElementsByTagName('a')[0];
    if (!anchor) return null;
    const href = anchor.getAttribute('href') || anchor.href;
    if (!href || href === '#' || href.startsWith('javascript:')) return null;
    return {
      href,
      text: (anchor.textContent || '').trim(),
      title: (anchor.getAttribute('title') || '').trim()
    };
  }

  function isAssetDetailsPage() {
    return /^\/agent\/assets\/.+/.test(window.location.pathname);
  }

  document.addEventListener('mousedown', handleModifiedClickPreview, true);
  document.addEventListener('click', handleModifiedClickPreview, true);
})();
