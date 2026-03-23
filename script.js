/**
 * DELPHI - Pella Christian Athletics
 * Core System Engine
 * Simulates API fetching, WebSocket data streams, and dynamic DOM diffing.
 */

// ============================================================================
// 1. MOCK DATA & API LAYER (Simulating 'Bound' or external provider)
// ============================================================================
const MockAPI = {
    getTickerData: () => [
        { team1: 'Pella Christian', score1: 68, team2: 'Oskaloosa', score2: 65, status: 'Q4 02:14', winner: 1 },
        { team1: 'PC Girls', score1: 54, team2: 'Oskaloosa Girls', score2: 42, status: 'FINAL', winner: 1 },
        { team1: 'Dallas Center-Grimes', score1: 71, team2: 'Pella', score2: 69, status: 'FINAL', winner: 1 },
        { team1: 'Indianola', score1: 45, team2: 'Newton', score2: 38, status: 'Half', winner: 1 },
        { team1: 'PC JV', score1: 50, team2: 'Oskaloosa JV', score2: 48, status: 'FINAL', winner: 1 }
    ],

    getNewsData: () => [
        { title: "Eagles Clinch Top Seed in Conference Tournament", img: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=400&q=80", tag: "Varsity Boys" },
        { title: "Record-Breaking Night for Senior Point Guard", img: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=400&q=80", tag: "Milestone" },
        { title: "Girls Basketball Advances to Regional Final", img: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?auto=format&fit=crop&w=400&q=80", tag: "Varsity Girls" },
        { title: "Coach Interview: Preparing for State", img: "https://images.unsplash.com/photo-1574629810360-7efbb1925536?auto=format&fit=crop&w=400&q=80", tag: "Inside Access" }
    ],

    getTrendingPlayers: () => [
        { name: "T. Veenstra", stat: "24 PPG • 8 RPG", img: "avatar" },
        { name: "J. Van Gorp", stat: "18 PPG • 12 AST", img: "avatar" },
        { name: "M. DeJong", stat: "15 PPG • 4 STL", img: "avatar" },
        { name: "C. Nunnikhoven", stat: "12 PPG • 6 BLK", img: "avatar" }
    ],

    getStandings: () => [
        { team: "Pella Christian", w: 12, l: 2, pct: ".857", isPC: true },
        { team: "Dallas C-G", w: 11, l: 3, pct: ".785", isPC: false },
        { team: "Pella", w: 10, l: 4, pct: ".714", isPC: false },
        { team: "Indianola", w: 8, l: 6, pct: ".571", isPC: false },
        { team: "Oskaloosa", w: 5, l: 9, pct: ".357", isPC: false }
    ],

    // Seed data for the live game
    activeGame: {
        id: "game_98472",
        sport: "basketball",
        clock: 134, // Seconds remaining
        period: 4,
        teams: {
            home: { id: 'pc', name: "Pella Christian", score: 68, fg: 45, pt3: 38, reb: 32 },
            away: { id: 'osk', name: "Oskaloosa", score: 65, fg: 41, pt3: 33, reb: 28 }
        },
        events: [
            { id: 101, time: "Q4 02:20", team: "away", player: "M. Smith", type: "foul", desc: "Personal foul on M. Smith" },
            { id: 100, time: "Q4 02:35", team: "home", player: "J. Van Gorp", type: "3_pointer", desc: "J. Van Gorp makes 3-point jumper. Assist by T. Veenstra." },
            { id: 99, time: "Q4 02:50", team: "away", player: "D. Johnson", type: "2_pointer", desc: "D. Johnson makes driving layup." }
        ]
    }
};

// ============================================================================
// 2. LIVE GAME SIMULATION ENGINE
// ============================================================================
class GameSimulator {
    constructor() {
        this.gameState = MockAPI.activeGame;
        this.isRunning = false;
        this.clockInterval = null;
        this.eventInterval = null;
        
        // Potential realistic events to simulate live action
        this.eventTemplates = [
            { team: "home", type: "2_pointer", points: 2, msg: "[PLAYER] makes a jump shot." },
            { team: "home", type: "3_pointer", points: 3, msg: "[PLAYER] hits a clutch 3-pointer from the wing!" },
            { team: "home", type: "rebound", points: 0, msg: "Defensive rebound by [PLAYER]." },
            { team: "home", type: "foul", points: 0, msg: "Offensive foul drawn by [PLAYER]." },
            { team: "away", type: "2_pointer", points: 2, msg: "[PLAYER] drives to the basket for a layup." },
            { team: "away", type: "3_pointer", points: 3, msg: "[PLAYER] drains a 3-pointer." },
            { team: "away", type: "rebound", points: 0, msg: "Offensive rebound secured by [PLAYER]." },
            { team: "away", type: "turnover", points: 0, msg: "Turnover by [PLAYER], steps out of bounds." }
        ];

        this.rosters = {
            home: ["T. Veenstra", "J. Van Gorp", "M. DeJong", "C. Nunnikhoven", "L. Schelhaas"],
            away: ["M. Smith", "D. Johnson", "K. Williams", "A. Brown", "T. Davis"]
        };
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Tick clock down every second
        this.clockInterval = setInterval(() => this.tickClock(), 1000);

        // Randomly generate a basketball event every 4 to 8 seconds
        this.generateRandomEvent();
    }

    tickClock() {
        if (this.gameState.clock > 0) {
            this.gameState.clock--;
            UIController.updateClock(this.gameState.clock);
        } else {
            clearInterval(this.clockInterval);
            UIController.updateClockString("FINAL");
        }
    }

    generateRandomEvent() {
        if (!this.isRunning || this.gameState.clock <= 0) return;

        const nextDelay = Math.floor(Math.random() * 5000) + 4000; // 4-9 seconds
        setTimeout(() => {
            const template = this.eventTemplates[Math.floor(Math.random() * this.eventTemplates.length)];
            const player = this.rosters[template.team][Math.floor(Math.random() * 5)];
            
            // Format time string
            const minutes = Math.floor(this.gameState.clock / 60);
            const seconds = this.gameState.clock % 60;
            const timeStr = `Q4 ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Create Event Node
            const newEvent = {
                id: Date.now(),
                time: timeStr,
                team: template.team,
                player: player,
                type: template.type,
                desc: template.msg.replace("[PLAYER]", `<strong>${player}</strong>`),
                points: template.points
            };

            // Update State
            this.gameState.events.unshift(newEvent); // Add to top
            if (template.points > 0) {
                this.gameState.teams[template.team].score += template.points;
            }

            // Dispatch update to UI
            UIController.renderNewEvent(newEvent);
            if (template.points > 0) {
                UIController.updateScore(this.gameState.teams);
            }

            // Loop
            this.generateRandomEvent();
        }, nextDelay);
    }
}

// ============================================================================
// 3. UI CONTROLLER (DOM Manipulation & Rendering)
// ============================================================================
const UIController = {
    init() {
        this.renderTicker();
        this.renderNews();
        this.renderTrending();
        this.renderStandings();
        this.initializeGamecast();
    },

    renderTicker() {
        const ticker = document.getElementById('global-ticker');
        const data = MockAPI.getTickerData();
        
        // Clone array to make an infinite seamless loop visually
        const displayData = [...data, ...data]; 
        
        ticker.innerHTML = displayData.map(game => `
            <div class="ticker-item">
                <span class="ticker-team ${game.winner === 1 ? 'ticker-winner' : ''}">${game.team1}</span>
                <span class="ticker-score">${game.score1}</span>
                <span style="color:var(--border-glass)">-</span>
                <span class="ticker-score">${game.score2}</span>
                <span class="ticker-team ${game.winner === 2 ? 'ticker-winner' : ''}">${game.team2}</span>
                <span style="color:var(--accent-red); margin-left: 5px;">${game.status}</span>
            </div>
        `).join('');
    },

    renderNews() {
        const container = document.getElementById('news-container');
        const data = MockAPI.getNewsData();
        
        container.innerHTML = data.map(item => `
            <div class="news-card">
                <div class="news-img" style="background-image: url('${item.img}')"></div>
                <div class="news-content">
                    <span class="news-tag">${item.tag}</span>
                    <h3 class="news-title">${item.title}</h3>
                </div>
            </div>
        `).join('');
    },

    renderTrending() {
        const container = document.getElementById('trending-container');
        const data = MockAPI.getTrendingPlayers();
        
        container.innerHTML = data.map((player, index) => `
            <li class="trending-item">
                <span class="player-rank">0${index + 1}</span>
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    <span class="player-stat">${player.stat}</span>
                </div>
                <i class="fa-solid fa-chevron-right" style="color:var(--border-glass); font-size:0.8rem;"></i>
            </li>
        `).join('');
    },

    renderStandings() {
        const tbody = document.getElementById('standings-body');
        const data = MockAPI.getStandings();
        
        tbody.innerHTML = data.map(team => `
            <tr class="${team.isPC ? 'highlight-row' : ''}">
                <td>${team.team}</td>
                <td>${team.w}</td>
                <td>${team.l}</td>
                <td>${team.pct}</td>
            </tr>
        `).join('');
    },

    initializeGamecast() {
        const game = MockAPI.activeGame;
        this.updateScore(game.teams);
        
        // Render initial historical events
        const feed = document.getElementById('pbp-feed');
        feed.innerHTML = '';
        game.events.forEach(ev => this.renderNewEvent(ev, false));
    },

    updateClock(secondsRemaining) {
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        document.getElementById('game-clock').innerText = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    updateClockString(str) {
        document.getElementById('game-clock').innerText = str;
    },

    updateScore(teams) {
        const homeEl = document.getElementById('score-home');
        const awayEl = document.getElementById('score-away');
        
        // Only trigger animation if score actually changed
        if (parseInt(homeEl.innerText) !== teams.home.score) {
            homeEl.innerText = teams.home.score;
            this.flashElement(homeEl);
        }
        
        if (parseInt(awayEl.innerText) !== teams.away.score) {
            awayEl.innerText = teams.away.score;
            this.flashElement(awayEl);
        }
    },

    renderNewEvent(eventObj, animate = true) {
        const feed = document.getElementById('pbp-feed');
        const li = document.createElement('li');
        
        li.className = `pbp-item ${eventObj.team} ${eventObj.points > 0 ? 'scoring' : ''}`;
        li.innerHTML = `
            <span class="pbp-time">${eventObj.time}</span>
            <span class="pbp-desc">${eventObj.desc}</span>
        `;
        
        feed.insertBefore(li, feed.firstChild);
        
        // Keep DOM light, max 50 items
        if (feed.children.length > 50) {
            feed.removeChild(feed.lastChild);
        }
    },

    flashElement(el) {
        el.classList.remove('updated');
        void el.offsetWidth; // Trigger reflow to restart CSS animation
        el.classList.add('updated');
    }
};

// ============================================================================
// 4. APPLICATION BOOTSTRAP
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Render all static/initial UI elements
    UIController.init();

    // 2. Boot up the Live Simulation Engine
    const simulator = new GameSimulator();
    simulator.start();

    // 3. Attach basic interactive listeners (Navigation tabs, filters)
    document.querySelectorAll('.pbp-filters button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pbp-filters button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // Logic to filter the PBP array would go here in a full SPA
        });
    });
});
