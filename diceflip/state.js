(() => {
  const GAME_ID = "diceflip";
  const STATE_ENDPOINT = "/api/diceflip/state";
  const SCORES_ENDPOINT = "/api/scores";

  function clone(value) {
    return value ? JSON.parse(JSON.stringify(value)) : value;
  }

  function defaultState() {
    return {
      stats: {
        highestScore: 0,
        lastScore: 0,
        bestLevel: 1,
        totalGames: 0,
        bestMatches3: 0,
        bestMatches4: 0,
        bestMatches5: 0,
        bestMatches6Plus: 0,
        bestNumbersMatched: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0
        }
      },
      unlocks: {
        skins: {
          classic: true,
          pastel: false,
          neon: false,
          galaxy: false
        },
        selectedSkin: "classic"
      },
      achievements: {
        unlocked: [],
        milestones: {}
      },
      version: 1
    };
  }

  async function fetchPrincipal() {
    try {
      const response = await fetch("/.auth/me", {
        credentials: "include",
        cache: "no-store"
      });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      return payload && payload.clientPrincipal ? payload.clientPrincipal : null;
    } catch (_error) {
      return null;
    }
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  const DiceFlipCloud = {
    principal: null,
    userKey: null,
    state: null,
    game: null,
    ready: false,
    pendingSave: null,
    lastSavedPayload: null,

    async init(game) {
      this.game = game;
      this.principal = await fetchPrincipal();
      if (!this.principal) {
        this.renderLeaderboard();
        return;
      }
      this.userKey = this.principal.userId || this.principal.userDetails || this.principal.id || null;
      await this.loadState();
      this.applyToGame();
      this.ready = true;
      this.renderLeaderboard();
    },

    async loadState() {
      try {
        const payload = await fetchJson(STATE_ENDPOINT, {
          credentials: "include",
          cache: "no-store"
        });
        const statePayload = payload && payload.state ? payload.state : null;
        this.state = clone(statePayload) || defaultState();
      } catch (error) {
        console.warn("DiceFlipCloud: failed to load state, using defaults", error);
        this.state = defaultState();
      }
    },

    applyToGame() {
      if (!this.game || !this.state) {
        return;
      }

      const stats = this.state.stats || {};
      this.game.allTimeStats = clone(stats);
      const highestScore = typeof stats.highestScore === "number" ? stats.highestScore : 0;
      this.game.highScore = highestScore;

      const unlocked = [];
      const unlockConfig = this.state.unlocks || {};
      const skins = unlockConfig.skins || {};
      Object.keys(skins).forEach((skin) => {
        if (skins[skin]) {
          unlocked.push(skin);
        }
      });
      if (!unlocked.includes("classic")) {
        unlocked.unshift("classic");
      }
      this.game.unlockedSkins = unlocked;

      const selectedSkin = unlockConfig.selectedSkin;
      if (selectedSkin && unlocked.includes(selectedSkin)) {
        this.game.currentSkin = selectedSkin;
      } else {
        this.game.currentSkin = "classic";
      }

      if (typeof this.game.applySkinToBoard === "function") {
        this.game.applySkinToBoard();
      }
      if (typeof this.game.updateSkinsPanel === "function") {
        this.game.updateSkinsPanel();
      }
      if (typeof this.game.updateStartScreenStats === "function") {
        this.game.updateStartScreenStats();
      }
      this.renderSummary();
    },

    getStats() {
      return this.state ? clone(this.state.stats) : null;
    },

    updateStats(stats) {
      if (!this.state) {
        this.state = defaultState();
      }
      this.state.stats = clone(stats);
      if (this.ready) {
        this.queueSave();
        this.renderSummary();
      }
    },

    getHighScore() {
      if (!this.state || !this.state.stats) {
        return null;
      }
      const score = this.state.stats.highestScore;
      return typeof score === "number" ? score : null;
    },

    updateHighScore(score) {
      if (!this.state) {
        this.state = defaultState();
      }
      if (typeof score === "number" && score > (this.state.stats.highestScore || 0)) {
        this.state.stats.highestScore = score;
        this.state.stats.lastScore = score;
        if (this.ready) {
          this.queueSave();
          this.renderSummary();
        }
      }
    },

    getUnlockedSkins() {
      if (!this.state || !this.state.unlocks || !this.state.unlocks.skins) {
        return null;
      }
      const unlocked = [];
      Object.entries(this.state.unlocks.skins).forEach(([skin, isUnlocked]) => {
        if (isUnlocked) {
          unlocked.push(skin);
        }
      });
      if (!unlocked.includes("classic")) {
        unlocked.unshift("classic");
      }
      return unlocked;
    },

    getSelectedSkin() {
      if (!this.state || !this.state.unlocks) {
        return null;
      }
      return this.state.unlocks.selectedSkin || null;
    },

    updateSkins(unlockedSkins, selectedSkin) {
      if (!this.state) {
        this.state = defaultState();
      }
      const skins = {
        classic: true,
        pastel: unlockedSkins.includes("pastel"),
        neon: unlockedSkins.includes("neon"),
        galaxy: unlockedSkins.includes("galaxy")
      };
      this.state.unlocks = {
        skins,
        selectedSkin: skins[selectedSkin] ? selectedSkin : "classic"
      };
      if (this.ready) {
        this.queueSave();
        this.renderSummary();
      }
    },

    updateAchievements(payload) {
      if (!payload) {
        return;
      }
      if (!this.state) {
        this.state = defaultState();
      }
      const unlocked = Array.isArray(payload.unlocked) ? payload.unlocked : [];
      const milestones = payload.milestones && typeof payload.milestones === "object" ? payload.milestones : {};

      const currentUnlocked = new Set(this.state.achievements.unlocked || []);
      unlocked.forEach((badge) => {
        if (typeof badge === "string" && badge.length > 0) {
          currentUnlocked.add(badge);
        }
      });

      this.state.achievements.unlocked = Array.from(currentUnlocked).slice(0, 200);
      this.state.achievements.milestones = {
        ...(this.state.achievements.milestones || {}),
        ...milestones
      };

      if (this.ready) {
        this.queueSave();
      }
    },

    async submitScore(score, metadata = {}) {
      if (!this.principal || !Number.isFinite(score)) {
        return;
      }
      try {
        const response = await fetchJson(SCORES_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            gameId: GAME_ID,
            score,
            meta: {
              level: metadata.level,
              matches3: metadata.matches3,
              matches4: metadata.matches4,
              matches5: metadata.matches5,
              matches6Plus: metadata.matches6Plus
            }
          })
        });
        if (response && Object.prototype.hasOwnProperty.call(response, "bestScore") && this.state) {
          const bestScore = response.bestScore;
          this.state.stats.highestScore = Math.max(this.state.stats.highestScore || 0, bestScore);
          this.renderSummary();
        }
        this.renderLeaderboard();
      } catch (error) {
        console.warn("DiceFlipCloud: score submission failed", error);
      }
    },

    queueSave() {
      if (!this.principal) {
        return;
      }
      if (this.pendingSave) {
        clearTimeout(this.pendingSave);
      }
      const payload = clone(this.state);
      this.pendingSave = setTimeout(() => {
        this.persistState(payload);
      }, 600);
    },

    async persistState(payload) {
      this.pendingSave = null;
      const body = JSON.stringify(payload);
      if (this.lastSavedPayload === body) {
        return;
      }
      try {
        await fetchJson(STATE_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body
        });
        this.lastSavedPayload = body;
      } catch (error) {
        console.warn("DiceFlipCloud: failed to persist state", error);
      }
    },

    renderSummary() {
      if (!this.state) {
        return;
      }
      const stats = this.state.stats;

      const bestScoreEl = document.getElementById("df-best-score");
      if (bestScoreEl) {
        bestScoreEl.textContent = (stats.highestScore || 0).toLocaleString();
      }

      const highScoreUi = document.getElementById("high-score");
      if (highScoreUi) {
        highScoreUi.textContent = (stats.highestScore || 0).toLocaleString();
      }

      const bestLevelEl = document.getElementById("df-best-level");
      if (bestLevelEl) {
        bestLevelEl.textContent = stats.bestLevel || 1;
      }

      const totalGamesEl = document.getElementById("df-total-games");
      if (totalGamesEl) {
        totalGamesEl.textContent = stats.totalGames || 0;
      }

      const badgeListEl = document.getElementById("df-achievements");
      if (badgeListEl) {
        const achievements = this.state && this.state.achievements ? this.state.achievements : {};
        const unlocked = Array.isArray(achievements.unlocked) ? achievements.unlocked : [];
        badgeListEl.innerHTML = "";
        if (!unlocked.length) {
          const li = document.createElement("li");
          li.textContent = "No achievements yet - set a new record!";
          badgeListEl.appendChild(li);
        } else {
          unlocked.slice(0, 8).forEach((badge) => {
            const li = document.createElement("li");
            li.textContent = badge.replace(/[-_]/g, " ");
            badgeListEl.appendChild(li);
          });
        }
      }

      if (this.game && typeof this.game.updateStartScreenStats === "function") {
        this.game.updateStartScreenStats();
      }
    },

    async renderLeaderboard() {
      const listEl = document.getElementById("diceflip-leaderboard");
      const statusEl = document.getElementById("diceflip-leaderboard-status");
      if (!listEl || !statusEl) {
        return;
      }

      if (!this.principal) {
        statusEl.textContent = "Sign in with Google to track personal and global rankings.";
        listEl.innerHTML = "";
        return;
      }

      statusEl.textContent = "Loading leaderboard...";
      listEl.innerHTML = "";

      try {
        const payload = await fetchJson(`${SCORES_ENDPOINT}?gameId=${encodeURIComponent(GAME_ID)}&limit=25`, {
          credentials: "include",
          cache: "no-store"
        });
        const entries = Array.isArray(payload.entries) ? payload.entries : [];
        listEl.innerHTML = "";

        if (!entries.length) {
          statusEl.textContent = "No runs have been recorded yet. Be the first to roll!";
          return;
        }

        statusEl.textContent = "";
        entries.forEach((entry, index) => {
          const li = document.createElement("li");
          li.className = "score-row";

          const rank = document.createElement("span");
          rank.className = "rank";
          rank.textContent = index + 1;

          const player = document.createElement("span");
          player.className = "player";
          player.textContent = (entry.displayName || entry.userId || "Player").replace(/@.*/, "");

          const score = document.createElement("span");
          score.className = "score";
          score.textContent = Number(entry.bestScore || entry.score || 0).toLocaleString();

          li.append(rank, player, score);

          if (entry.updatedAt) {
            const meta = document.createElement("small");
            const date = new Date(entry.updatedAt);
            if (!Number.isNaN(date.valueOf())) {
              meta.textContent = "Updated " + date.toLocaleDateString() + " " + date.toLocaleTimeString();
            }
            li.appendChild(meta);
          }

          const normalizedUser = this.userKey && entry.userId && entry.userId.toLowerCase() === this.userKey.toLowerCase();
          if (normalizedUser) {
            li.classList.add("score-row-me");
          }

          listEl.appendChild(li);
        });
      } catch (error) {
        console.warn("DiceFlipCloud: failed to load leaderboard", error);
        statusEl.textContent = "Leaderboard unavailable right now.";
      }
    }
  };

  window.DiceFlipCloud = DiceFlipCloud;
})();


