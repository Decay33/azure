(function () {
  const GAME_ID = 'cavegrok';
  const STATE_ENDPOINT = '/api/cavegrok/state';
  const STORAGE_TO_UNLOCK = {
    hotPinkShipUnlocked: 'hotPink',
    purpleShipUnlocked: 'purple',
    goldenShipUnlocked: 'golden'
  };

  function defaultState() {
    return {
      unlocks: {
        hotPink: false,
        purple: false,
        golden: false
      },
      purchases: {},
      inventory: {
        coins: 0
      },
      progress: {
        lastLevel: 1
      },
      stats: {
        lastScore: 0,
        bestScore: 0
      },
      version: 1
    };
  }

  function sanitizeUnlocks(raw) {
    const base = defaultState().unlocks;
    if (!raw || typeof raw !== 'object') {
      return { ...base };
    }
    return {
      hotPink: Boolean(raw.hotPink),
      purple: Boolean(raw.purple),
      golden: Boolean(raw.golden)
    };
  }

  function sanitizeInventory(raw) {
    const base = defaultState().inventory;
    if (!raw || typeof raw !== 'object') {
      return { ...base };
    }

    const coins = Number(raw.coins);
    return {
      coins: Number.isFinite(coins) && coins >= 0 ? Math.floor(coins) : base.coins
    };
  }

  function sanitizeProgress(raw) {
    const base = defaultState().progress;
    if (!raw || typeof raw !== 'object') {
      return { ...base };
    }

    const lastLevel = Number(raw.lastLevel);
    return {
      lastLevel:
        Number.isFinite(lastLevel) && lastLevel > 0 && lastLevel < 1000
          ? Math.floor(lastLevel)
          : base.lastLevel
    };
  }

  function sanitizeStats(raw) {
    const base = defaultState().stats;
    const stats = { ...base };
    if (!raw || typeof raw !== 'object') {
      return stats;
    }

    if (raw.lastScore !== undefined) {
      const lastScore = Number(raw.lastScore);
      if (Number.isFinite(lastScore) && lastScore >= 0) {
        stats.lastScore = Math.floor(lastScore);
      }
    }

    if (raw.bestScore !== undefined) {
      const bestScore = Number(raw.bestScore);
      if (Number.isFinite(bestScore) && bestScore >= 0) {
        stats.bestScore = Math.floor(bestScore);
      }
    }

    return stats;
  }

  function sanitizePurchases(raw) {
    if (!raw || typeof raw !== 'object') {
      return {};
    }

    const safe = {};
    const allowKey = /^[a-z0-9_-]{1,64}$/i;

    for (const [key, value] of Object.entries(raw)) {
      if (!allowKey.test(key)) {
        continue;
      }

      const entry = {};
      const purchased = value && typeof value === 'object' ? value : {};

      entry.owned = Boolean(purchased.owned ?? true);

      if (typeof purchased.provider === 'string') {
        entry.provider = purchased.provider.slice(0, 64);
      }
      if (typeof purchased.transactionId === 'string') {
        entry.transactionId = purchased.transactionId.slice(0, 128);
      }
      if (typeof purchased.currency === 'string') {
        entry.currency = purchased.currency.slice(0, 16).toUpperCase();
      }

      const amount = Number(purchased.amount);
      if (Number.isFinite(amount) && amount >= 0) {
        entry.amount = Number(amount.toFixed(2));
      }

      if (purchased.purchasedAt) {
        const stamp = new Date(purchased.purchasedAt);
        if (!Number.isNaN(stamp.valueOf())) {
          entry.purchasedAt = stamp.toISOString();
        }
      }

      if (!entry.purchasedAt) {
        entry.purchasedAt = new Date().toISOString();
      }

      safe[key] = entry;
    }

    return safe;
  }

  function mergePayload(target, patch) {
    if (!patch) {
      return target || null;
    }

    if (!target) {
      return JSON.parse(JSON.stringify(patch));
    }

    const merged = { ...target };

    if (patch.unlocks) {
      merged.unlocks = { ...(target.unlocks || {}), ...patch.unlocks };
    }
    if (patch.purchases) {
      merged.purchases = { ...(target.purchases || {}), ...patch.purchases };
    }
    if (patch.inventory) {
      merged.inventory = { ...(target.inventory || {}), ...patch.inventory };
    }
    if (patch.progress) {
      merged.progress = { ...(target.progress || {}), ...patch.progress };
    }
    if (patch.stats) {
      merged.stats = { ...(target.stats || {}), ...patch.stats };
    }
    if (patch.version) {
      merged.version = patch.version;
    }

    return merged;
  }

  function normalizeState(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object') {
      return base;
    }

    return {
      unlocks: sanitizeUnlocks(raw.unlocks || raw.state?.unlocks),
      purchases: sanitizePurchases(raw.purchases || raw.state?.purchases),
      inventory: sanitizeInventory(raw.inventory || raw.state?.inventory),
      progress: sanitizeProgress(raw.progress || raw.state?.progress),
      stats: sanitizeStats(raw.stats || raw.state?.stats),
      version: raw.version || base.version
    };
  }

  function sanitizeName(value) {
    if (!value && value !== 0) {
      return null;
    }
    let text = String(value).trim();
    if (!text) {
      return null;
    }
    const atIndex = text.indexOf('@');
    if (atIndex > 0) {
      text = text.slice(0, atIndex);
    }
    text = text.split(/\s+/)[0];
    text = text.replace(/[^A-Za-z0-9_-]/g, '');
    if (!text) {
      return null;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function normalizeIdentifier(value) {
    if (!value && value !== 0) {
      return null;
    }
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function deriveFirstName() {
    for (let i = 0; i < arguments.length; i += 1) {
      const name = sanitizeName(arguments[i]);
      if (name) {
        return name;
      }
    }
    return 'Explorer';
  }

  function getClaim(principal, types) {
    if (!principal?.claims) {
      return null;
    }
    const wanted = types.map((type) => String(type).toLowerCase());
    for (const claim of principal.claims) {
      const claimType = String(claim?.typ || '').toLowerCase();
      if (wanted.includes(claimType)) {
        return claim.val;
      }
    }
    return null;
  }

  const caveGrok = {
    principal: null,
    userKey: null,
    firstName: 'Explorer',
    state: defaultState(),
    ready: false,
    personalBest: 0,
    lastSubmittedScore: null,
    pendingPayload: null,
    saveTimer: null,
    syncingLocalStorage: false,
    leaderboardLoaded: false,
    purchaseSetup: false,
    dom: {},

    async init() {
      this.captureDom();
      this.updateScoreSummary();
      this.refreshUnlockUi();
      this.updatePurchasePanel();
      this.updateAuthUi();

      const principal = await this.fetchPrincipal();
      this.principal = principal;
      if (principal) {
        const givenName = getClaim(principal, ['name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']);
        this.firstName = deriveFirstName(givenName, principal.userDetails, principal.userId);
        this.userKey = normalizeIdentifier(principal.userId || principal.userDetails || principal.id);
        this.updateAuthUi();
        await this.fetchState();
        await this.loadLeaderboard();
      } else {
        this.renderLeaderboard(null);
        this.updatePurchasePanel();
      }

      this.ready = true;
      this.notifyGameOfUnlocks();
      this.updateScoreSummary();

      window.addEventListener('focus', () => {
        this.handleWindowFocus();
      });
    },

    captureDom() {
      this.dom = {
        authBanner: document.getElementById('auth-banner'),
        authStatus: document.getElementById('auth-status'),
        signInLink: document.getElementById('sign-in-link'),
        signOutLink: document.getElementById('sign-out-link'),
        unlockCount: document.getElementById('cave-unlock-count'),
        personalBest: document.getElementById('cave-personal-best'),
        highestLevel: document.getElementById('cave-highest-level'),
        lastScore: document.getElementById('cave-last-score'),
        leaderboardList: document.getElementById('leaderboard-list'),
        leaderboardEmpty: document.getElementById('leaderboard-empty'),
        purchaseStatus: document.getElementById('purchaseStatusMessage'),
        unlockButton: document.getElementById('unlockButton'),
        purchasePanel: document.getElementById('purchasePanel'),
        signInMessage: document.getElementById('purchaseSignInMessage')
      };
    },

    
    readLocalUnlock(key) {
      if (!window.localStorage) {
        return false;
      }
      try {
        return localStorage.getItem(key) === 'true';
      } catch (_error) {
        return false;
      }
    },

    ensureLocalUnlockConsistency() {
      const unlocks = this.state.unlocks || {};
      const purchases = this.state.purchases || {};
      const localHotPink = this.readLocalUnlock('hotPinkShipUnlocked');
      const localPurple = this.readLocalUnlock('purpleShipUnlocked');
      const localGolden = this.readLocalUnlock('goldenShipUnlocked');

      let needsPersist = false;
      if ((localHotPink || purchases.hotPinkShip?.owned) && !unlocks.hotPink) {
        unlocks.hotPink = true;
        needsPersist = true;
      }
      if ((localPurple || purchases.purpleShip?.owned) && !unlocks.purple) {
        unlocks.purple = true;
        needsPersist = true;
      }
      if ((localGolden || purchases.goldenShip?.owned) && !unlocks.golden) {
        unlocks.golden = true;
        needsPersist = true;
      }

      if (needsPersist) {
        this.notifyGameOfUnlocks();
        if (this.principal) {
          this.scheduleStateSave({ unlocks }, { delay: 0 });
        }
      }
    },

    async fetchPrincipal() {
      try {
        const response = await fetch('/.auth/me', {
          credentials: 'include',
          cache: 'no-store'
        });
        if (!response.ok) {
          return null;
        }
        const payload = await response.json();
        return payload?.clientPrincipal || null;
      } catch (_error) {
        return null;
      }
    },

    async fetchState() {
      try {
        const response = await fetch(STATE_ENDPOINT, {
          credentials: 'include',
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error('Failed to load state');
        }
        const payload = await response.json();
        if (payload && payload.state) {
          this.state = normalizeState(payload.state);
        } else {
          this.state = defaultState();
        }
      } catch (error) {
        console.warn('CaveGrok state load failed', error);
        this.state = defaultState();
      }
          this.ensureLocalUnlockConsistency();
          this.syncLocalStorage();
      this.refreshUnlockUi();
      this.updatePurchasePanel();
      this.notifyGameOfUnlocks();
      this.updateScoreSummary();
    },

    applyStatePatch(partial) {
      if (!partial || typeof partial !== 'object') {
        return {};
      }

      const sanitized = {};

      if (partial.unlocks) {
        const unlocks = sanitizeUnlocks(partial.unlocks);
        const previous = { ...this.state.unlocks };
        Object.assign(this.state.unlocks, unlocks);
        sanitized.unlocks = unlocks;
        if (JSON.stringify(previous) !== JSON.stringify(this.state.unlocks)) {
          this.refreshUnlockUi();
        }
      }

      if (partial.purchases) {
        const purchases = sanitizePurchases(partial.purchases);
        this.state.purchases = { ...this.state.purchases, ...purchases };
        sanitized.purchases = purchases;
      }

      if (partial.inventory) {
        const inventory = sanitizeInventory(partial.inventory);
        this.state.inventory = { ...this.state.inventory, ...inventory };
        sanitized.inventory = inventory;
      }

      if (partial.progress) {
        const progress = sanitizeProgress(partial.progress);
        const highest = Math.max(this.state.progress.lastLevel || 1, progress.lastLevel || 1);
        this.state.progress.lastLevel = highest;
        sanitized.progress = { lastLevel: highest };
      }

      if (partial.stats) {
        const stats = sanitizeStats(partial.stats);
        if (stats.lastScore !== undefined) {
          this.state.stats.lastScore = stats.lastScore;
          sanitized.stats = sanitized.stats || {};
          sanitized.stats.lastScore = stats.lastScore;
        }
        if (stats.bestScore !== undefined) {
          const best = Math.max(this.state.stats.bestScore || 0, stats.bestScore || 0);
          this.state.stats.bestScore = best;
          sanitized.stats = sanitized.stats || {};
          sanitized.stats.bestScore = best;
        }
      }

      if (partial.version) {
        this.state.version = partial.version;
        sanitized.version = partial.version;
      }

      return sanitized;
    },

    scheduleStateSave(partial, options = {}) {
      const sanitizedPatch = this.applyStatePatch(partial);
      if (!sanitizedPatch || Object.keys(sanitizedPatch).length === 0) {
        return null;
      }

      this.pendingPayload = mergePayload(this.pendingPayload, sanitizedPatch);
      this.updateScoreSummary();

      if (!this.principal) {
        return null;
      }

      if (options.immediate) {
        const payload = this.pendingPayload;
        this.pendingPayload = null;
        clearTimeout(this.saveTimer);
        return this.persistState(payload);
      }

      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        const payload = this.pendingPayload;
        this.pendingPayload = null;
        if (payload) {
          this.persistState(payload).catch((error) => {
            console.warn('Failed to persist CaveGrok state', error);
          });
        }
      }, options.delay ?? 500);

      return null;
    },

    async persistState(payload) {
      if (!this.principal || !payload || Object.keys(payload).length === 0) {
        return this.state;
      }

      try {
        const response = await fetch(STATE_ENDPOINT, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('State save failed');
        }

        const result = await response.json();
        if (result && result.state) {
          this.state = normalizeState(result.state);
          this.ensureLocalUnlockConsistency();
          this.syncLocalStorage();
          this.refreshUnlockUi();
          this.updateScoreSummary();
          this.notifyGameOfUnlocks();
        }
      } catch (error) {
        console.warn('Unable to save CaveGrok state', error);
        throw error;
      }

      return this.state;
    },

    persistUnlocks(unlocks, options = {}) {
      if (!unlocks || typeof unlocks !== 'object') {
        return null;
      }
      return this.scheduleStateSave({ unlocks }, options);
    },

    persistProgress(progress, stats) {
      const patch = {};
      if (progress) {
        patch.progress = { lastLevel: progress.lastLevel };
      }
      if (stats) {
        patch.stats = { ...stats };
      }
      return this.scheduleStateSave(patch, { delay: 600 });
    },

    handleRunComplete(info = {}) {
      if (!this.principal) {
        return;
      }
      const level = Number(info.level);
      const score = Number(info.score);
      const sanitizedLevel = Number.isFinite(level) && level > 0 ? Math.floor(level) : this.state.progress.lastLevel;
      const sanitizedScore = Number.isFinite(score) && score >= 0 ? Math.floor(score) : 0;

      const statsPatch = { lastScore: sanitizedScore };
      if (sanitizedScore > (this.state.stats.bestScore || 0)) {
        this.state.stats.bestScore = sanitizedScore;
        statsPatch.bestScore = sanitizedScore;
        this.updateScoreSummary();
      }

      this.persistProgress({ lastLevel: sanitizedLevel }, statsPatch);
      this.submitScore(sanitizedScore, info.status || 'complete');
    },

    submitScore(value, reason) {
      if (!this.principal) {
        return;
      }
      if (!Number.isFinite(value) || value <= 0) {
        return;
      }

      const score = Math.floor(value);
      const now = Date.now();
      if (this.lastSubmittedScore && this.lastSubmittedScore.score === score && now - this.lastSubmittedScore.at < 1500) {
        return;
      }

      this.lastSubmittedScore = { score, at: now };

      fetch('/api/scores', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId: GAME_ID, score })
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('score submission failed');
          }
          return response.json();
        })
        .then((payload) => {
          if (payload && Number.isFinite(payload.bestScore)) {
            const best = Math.max(this.state.stats.bestScore || 0, payload.bestScore);
            this.state.stats.bestScore = best;
            this.updateScoreSummary();
          }
          if (payload?.updated) {
            this.loadLeaderboard();
          } else if (!this.leaderboardLoaded) {
            this.loadLeaderboard();
          }
        })
        .catch((error) => {
          console.warn('CaveGrok score submission failed', error, reason);
        });
    },

    async loadLeaderboard() {
      const list = this.dom.leaderboardList;
      const status = this.dom.leaderboardEmpty;
      if (!list || !status) {
        return;
      }

      if (!this.principal) {
        list.innerHTML = '';
        status.textContent = 'Sign in to load the leaderboard.';
        status.classList.remove('hidden');
        this.leaderboardLoaded = false;
        return;
      }

      status.textContent = 'Loading leaderboard...';
      status.classList.remove('hidden');
      list.innerHTML = '';

      try {
        const response = await fetch(`/api/scores?gameId=${GAME_ID}&limit=25`, {
          credentials: 'include',
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error('Leaderboard request failed');
        }
        const payload = await response.json();
        const entries = Array.isArray(payload.entries) ? payload.entries : [];
        this.renderLeaderboard(entries);
        if (payload.myScore && Number.isFinite(payload.myScore.bestScore)) {
          const best = Math.max(this.state.stats.bestScore || 0, payload.myScore.bestScore);
          this.state.stats.bestScore = best;
        }
        this.updateScoreSummary();
        this.leaderboardLoaded = true;
      } catch (error) {
        console.warn('CaveGrok leaderboard load failed', error);
        status.textContent = 'Leaderboard unavailable right now.';
        status.classList.remove('hidden');
        this.leaderboardLoaded = false;
      }
    },

    renderLeaderboard(entries) {
      const list = this.dom.leaderboardList;
      const status = this.dom.leaderboardEmpty;
      if (!list || !status) {
        return;
      }

      list.innerHTML = '';

      if (!this.principal) {
        status.textContent = 'Sign in to load the leaderboard.';
        status.classList.remove('hidden');
        return;
      }

      if (!entries || entries.length === 0) {
        status.textContent = 'No runs recorded yet. Be the first to descend!';
        status.classList.remove('hidden');
        return;
      }

      status.classList.add('hidden');

      entries.forEach((entry, index) => {
        const li = document.createElement('li');
        li.className = 'score-row';

        const rank = document.createElement('span');
        rank.className = 'rank';
        rank.textContent = index + 1;

        const name = document.createElement('span');
        name.className = 'player';
        name.textContent = sanitizeName(entry.displayName) || 'Explorer';

        const score = document.createElement('span');
        score.className = 'score';
        score.textContent = Number(entry.bestScore || entry.score || 0).toLocaleString();

        li.append(rank, name, score);

        if (entry.updatedAt) {
          const meta = document.createElement('small');
          const date = new Date(entry.updatedAt);
          if (!Number.isNaN(date.valueOf())) {
            meta.textContent = 'Updated ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
          }
          li.appendChild(meta);
        }

        if (this.userKey && entry.userId === this.userKey) {
          li.classList.add('score-row-me');
        }

        list.appendChild(li);
      });
    },

    updateScoreSummary() {
      if (this.dom.personalBest) {
        this.dom.personalBest.textContent = Number(this.state.stats.bestScore || 0).toLocaleString();
      }
      if (this.dom.highestLevel) {
        this.dom.highestLevel.textContent = Number(this.state.progress.lastLevel || 1).toString();
      }
      if (this.dom.lastScore) {
        this.dom.lastScore.textContent = Number(this.state.stats.lastScore || 0).toLocaleString();
      }
      if (this.dom.unlockCount) {
        const unlocks = this.state.unlocks || {};
        const unlocked = ['hotPink', 'purple', 'golden'].filter((key) => unlocks[key]).length;
        this.dom.unlockCount.textContent = unlocked + ' / 3';
      }
    },

    refreshUnlockUi() {
      const unlocks = this.state.unlocks || {};
      document.querySelectorAll('[data-unlock]').forEach((node) => {
        const key = node.getAttribute('data-unlock');
        const unlocked = Boolean(unlocks[key]);
        node.classList.toggle('unlocked', unlocked);
        const statusEl = node.querySelector('[data-unlock-status]');
        if (statusEl) {
          statusEl.textContent = unlocked ? 'Unlocked' : 'Locked';
        }
      });

      if (window.CaveGrokPayPal) {
        if (unlocks.hotPink) {
          CaveGrokPayPal.showPurchasedBanner();
        }
      }

      this.updatePurchasePanel();
    },

    syncLocalStorage() {
      if (!window.localStorage) {
        return;
      }
      const unlocks = this.state.unlocks || {};
      const previous = {
        hotPink: this.readLocalUnlock('hotPinkShipUnlocked'),
        purple: this.readLocalUnlock('purpleShipUnlocked'),
        golden: this.readLocalUnlock('goldenShipUnlocked')
      };

      const final = {
        hotPink: previous.hotPink || Boolean(unlocks.hotPink),
        purple: previous.purple || Boolean(unlocks.purple),
        golden: previous.golden || Boolean(unlocks.golden)
      };

      let corrected = false;
      if (final.hotPink && !unlocks.hotPink) {
        unlocks.hotPink = true;
        corrected = true;
      }
      if (final.purple && !unlocks.purple) {
        unlocks.purple = true;
        corrected = true;
      }
      if (final.golden && !unlocks.golden) {
        unlocks.golden = true;
        corrected = true;
      }

      this.syncingLocalStorage = true;
      try {
        localStorage.setItem('hotPinkShipUnlocked', final.hotPink ? 'true' : 'false');
        localStorage.setItem('purpleShipUnlocked', final.purple ? 'true' : 'false');
        localStorage.setItem('goldenShipUnlocked', final.golden ? 'true' : 'false');
      } catch (error) {
        console.warn('Failed to sync localStorage for CaveGrok', error);
      } finally {
        this.syncingLocalStorage = false;
      }

      if (corrected) {
        this.refreshUnlockUi();
        this.scheduleStateSave({ unlocks }, { delay: 0 });
      }
    },

    handleStorageMutation(key, value) {
      if (this.syncingLocalStorage) {
        return;
      }
      const unlockKey = STORAGE_TO_UNLOCK[key];
      if (!unlockKey) {
        return;
      }
      const active = value === 'true' || value === true;
      if (this.state.unlocks[unlockKey] === active) {
        return;
      }
      if (!active && this.state.unlocks && this.state.unlocks[unlockKey]) {
        return;
      }
      const patch = { unlocks: { [unlockKey]: active } };
      this.scheduleStateSave(patch, { delay: 400 });
      this.notifyGameOfUnlocks();
      this.refreshUnlockUi();
      this.updateScoreSummary();
    },

    notifyGameOfUnlocks() {
      if (typeof window.caveGrokReloadUnlocks === 'function') {
        window.caveGrokReloadUnlocks();
      }
    },

    setGameAdapter(adapter) {
      this.gameAdapter = adapter;
      if (this.ready && adapter && typeof adapter.onStateReady === 'function') {
        adapter.onStateReady(this.state);
      }
    },

    updateAuthUi() {
      const signedIn = Boolean(this.principal);
      if (this.dom.signInLink) {
        if (signedIn) {
          this.dom.signInLink.classList.add('hidden');
        } else {
          this.dom.signInLink.classList.remove('hidden');
        }
      }
      if (this.dom.signOutLink) {
        if (signedIn) {
          this.dom.signOutLink.classList.remove('hidden');
        } else {
          this.dom.signOutLink.classList.add('hidden');
        }
      }
      if (this.dom.authStatus) {
        if (signedIn) {
          this.dom.authStatus.innerHTML = 'Signed in as <strong>' + this.firstName + '</strong>. Progress now syncs across devices.';
        } else {
          this.dom.authStatus.innerHTML = 'Sign in with Google to sync purchases, unlocks, and leaderboard standings.';
        }
      }
    },

    updatePurchasePanel() {
      if (!window.CaveGrokPayPal || !this.dom.unlockButton) {
        return;
      }

      if (!this.purchaseSetup) {
        CaveGrokPayPal.setup({
          onApprove: (payload) => {
            this.handlePurchaseSuccess(payload);
          },
          onError: () => {
            this.showPurchaseStatus('There was an issue processing the transaction. Please try again.', 'error');
          }
        });
        this.purchaseSetup = true;
      }

      CaveGrokPayPal.reset();

      if (!this.principal) {
        this.dom.unlockButton.classList.add('hidden');
        CaveGrokPayPal.showSignInMessage();
        this.showPurchaseStatus('Sign in to unlock the HOT Pink ship.', 'info');
        return;
      }

      if (this.state.unlocks.hotPink) {
        this.dom.unlockButton.classList.add('hidden');
        CaveGrokPayPal.showPurchasedBanner();
        this.showPurchaseStatus('HOT Pink ship unlocked and synced to your profile.', 'success');
        return;
      }

      this.showPurchaseStatus('Unlocks sync to your account instantly after checkout.', 'info');
      this.dom.unlockButton.disabled = false;
      this.dom.unlockButton.classList.remove('hidden');
    },

    showPurchaseStatus(message, variant) {
      if (!this.dom.purchaseStatus) {
        return;
      }
      this.dom.purchaseStatus.textContent = message || '';
      this.dom.purchaseStatus.className = 'purchase-message';
      if (variant) {
        this.dom.purchaseStatus.classList.add('purchase-' + variant);
      }
      if (message) {
        this.dom.purchaseStatus.classList.remove('hidden');
      } else {
        this.dom.purchaseStatus.classList.add('hidden');
      }
    },

    handlePurchaseSuccess(payload) {
      const details = payload?.details || {};
      const orderData = payload?.data || {};
      const capture = details?.purchase_units?.[0]?.payments?.captures?.[0] || {};
      const amount = Number(capture.amount?.value || payload.total || 0);
      const currency = capture.amount?.currency_code || 'USD';
      const transactionId = capture.id || orderData.orderID || orderData.id || null;
      const purchasedAt = capture.create_time || details.update_time || new Date().toISOString();
      const payerName = details?.payer?.name?.given_name || this.firstName;

      this.showPurchaseStatus('Thanks, ' + payerName + '! Unlocking your HOT Pink ship now.', 'success');

      const patch = {
        unlocks: { hotPink: true },
        purchases: {
          hotPinkShip: {
            owned: true,
            provider: 'paypal',
            transactionId,
            amount: Number.isFinite(amount) ? Number(amount.toFixed(2)) : undefined,
            currency,
            purchasedAt
          }
        }
      };

      this.scheduleStateSave(patch, { immediate: true })
        ?.then(() => {
          this.refreshUnlockUi();
          this.notifyGameOfUnlocks();
          this.updatePurchasePanel();
        })
        .catch(() => {
          this.showPurchaseStatus('Purchase captured, but we could not sync to storage. Try refreshing.', 'error');
        });
    },

    async handleWindowFocus() {
      const principal = await this.fetchPrincipal();
      if (!principal) {
        if (this.principal) {
          this.principal = null;
          this.state = defaultState();
          this.ensureLocalUnlockConsistency();
          this.syncLocalStorage();
          this.refreshUnlockUi();
          this.renderLeaderboard(null);
          this.updatePurchasePanel();
          this.updateAuthUi();
          this.updateScoreSummary();
        }
        return;
      }

      if (!this.principal || (principal.userId && this.principal.userId !== principal.userId)) {
        this.principal = principal;
        const givenName = getClaim(principal, ['name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']);
        this.firstName = deriveFirstName(givenName, principal.userDetails, principal.userId);
        this.userKey = normalizeIdentifier(principal.userId || principal.userDetails || principal.id);
        this.updateAuthUi();
        await this.fetchState();
        await this.loadLeaderboard();
      }
    }
  };

  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (window.caveGrok && typeof window.caveGrok.handleStorageMutation === 'function') {
      try {
        window.caveGrok.handleStorageMutation(key, value);
      } catch (error) {
        console.warn('CaveGrok storage setItem hook failed', error);
      }
    }
  };

  const originalRemoveItem = Storage.prototype.removeItem;
  Storage.prototype.removeItem = function (key) {
    originalRemoveItem.call(this, key);
    if (window.caveGrok && typeof window.caveGrok.handleStorageMutation === 'function') {
      try {
        window.caveGrok.handleStorageMutation(key, null);
      } catch (error) {
        console.warn('CaveGrok storage removeItem hook failed', error);
      }
    }
  };

  window.caveGrok = caveGrok;
  window.registerCaveGrokGame = function (adapter) {
    caveGrok.setGameAdapter(adapter);
  };

  document.addEventListener('DOMContentLoaded', () => {
    caveGrok.init();
  });
})();




















