// ============================================================
// CareBridge – Main Application Router & Controller
// app.js
// ============================================================

const PAGES = {
  dashboard:    { module: () => DashboardPage,    label: 'Dashboard'             },
  symptoms:     { module: () => SymptomsPage,     label: 'Symptom Recorder'      },
  prescription: { module: () => PrescriptionPage, label: 'Prescription Scanner'  },
  reminder:     { module: () => ReminderPage,     label: 'Medicine Reminder'     },
  chat:         { module: () => ChatPage,         label: 'AI Chat Assistant'     },
  availability: { module: () => AvailabilityPage, label: 'Medicine Availability' },
  caregiver:    { module: () => CaregiverPage,    label: 'Caregiver Dashboard'   },
};

const App = {
  _currentPage: null,

  // ── Bootstrap ─────────────────────────────────────────────
  init() {
    // Init Lucide icons for app shell
    lucide.createIcons();

    // Setup all navigation listeners
    this._bindNav();
    this._bindMobileDrawer();

    // Navigate to default page
    const hash = location.hash.replace('#', '');
    this.navigate(PAGES[hash] ? hash : 'dashboard');

    // Simulate a notification badge ping
    this._pingNotification();
  },

  // ── Navigation ────────────────────────────────────────────
  navigate(pageId) {
    if (!PAGES[pageId]) {
      console.warn('[App] Unknown page:', pageId);
      return;
    }

    // Update current page
    this._currentPage = pageId;
    location.hash = pageId;

    // Update sidebar nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
      const isActive = link.dataset.page === pageId;
      link.classList.toggle('active', isActive);
    });

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    // Scroll content to top
    const content = document.getElementById('page-content');
    if (content) content.scrollTop = 0;

    // Close mobile drawer if open
    this._closeDrawer();

    // Render the page
    const page = PAGES[pageId].module();
    if (page && typeof page.render === 'function') {
      page.render().then(() => {
        // Re-init lucide icons after page render
        lucide.createIcons({ nodes: [content] });
      }).catch(err => {
        console.error('[App] Page render error:', err);
      });
    }
  },

  // ── Sidebar / Nav Binding ─────────────────────────────────
  _bindNav() {
    // Sidebar nav links (desktop)
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.dataset.page);
      });
    });

    // Bottom nav buttons (mobile)
    document.querySelectorAll('.bottom-nav-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigate(btn.dataset.page);
      });
    });
  },

  // ── Mobile Drawer ─────────────────────────────────────────
  _bindMobileDrawer() {
    const drawer    = document.getElementById('mobile-drawer');
    const overlay   = document.getElementById('mobile-overlay');
    const openBtn   = document.getElementById('mobile-menu-btn');
    const closeBtn  = document.getElementById('close-drawer-btn');

    openBtn?.addEventListener('click',  () => this._openDrawer());
    closeBtn?.addEventListener('click', () => this._closeDrawer());
    overlay?.addEventListener('click',  () => this._closeDrawer());

    // Mobile drawer nav links
    document.querySelectorAll('#mobile-nav .nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.dataset.page);
      });
    });
  },

  _openDrawer() {
    const drawer  = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');
    drawer?.classList.remove('-translate-x-full');
    overlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  _closeDrawer() {
    const drawer  = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');
    drawer?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
    document.body.style.overflow = '';
  },

  // ── Notification ping (UX demo) ───────────────────────────
  _pingNotification() {
    setTimeout(() => {
      Components.toast('💊 Reminder: Amlodipine 5mg is due at 9:00 AM', 'info', 5000);
    }, 2500);
  },
};

// ── Init on DOM ready ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
