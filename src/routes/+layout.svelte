<script lang="ts">
    import './layout.css';
</script>

<div class="auth-shell">
    <!-- Left panel: brand -->
    <aside class="brand-panel" aria-hidden="true">

        <!-- Geometric background shapes -->
        <div class="geo geo-circle-1"></div>
        <div class="geo geo-circle-2"></div>
        <div class="geo geo-ring-1"></div>
        <div class="geo geo-ring-2"></div>
        <div class="geo geo-dot-grid"></div>

        <div class="brand-content">
            <!-- Logo -->
            <div class="brand-logo">
                <div class="logo-mark">
                    <span class="logo-cap">✨</span>
                </div>
                <div class="logo-text-wrap">
                    <span class="brand-name">PairUp</span>
                    <span class="brand-version">beta</span>
                </div>
            </div>

            <!-- Headline -->
            <div class="brand-copy">
                <h1 class="brand-headline">
                    Conexões que<br/>
                    <em>começam aqui.</em>
                </h1>
                <p class="brand-sub">
                    A plataforma de encontros feita<br/>
                    para a comunidade universitária.
                </p>
            </div>

            <!-- Stats strip -->
            <div class="stats-row">
                <div class="stat">
                    <span class="stat-num">🎓</span>
                    <span class="stat-label">Universitário</span>
                </div>
                <div class="stat-sep"></div>
                <div class="stat">
                    <span class="stat-num">100%</span>
                    <span class="stat-label">Gratuito</span>
                </div>
                <div class="stat-sep"></div>
                <div class="stat">
                    <span class="stat-num">🔒</span>
                    <span class="stat-label">Seguro</span>
                </div>
            </div>

            <!-- Floating profile cards -->
            <div class="cards-wrap">
                <div class="pcard pcard--a">
                    <div class="pcard-avatar pcard-avatar--a"></div>
                    <div class="pcard-info">
                        <div class="pcard-line pcard-line--name"></div>
                        <div class="pcard-line pcard-line--course"></div>
                    </div>
                    <div class="pcard-chip">Match ✓</div>
                </div>
                <div class="pcard pcard--b">
                    <div class="pcard-avatar pcard-avatar--b"></div>
                    <div class="pcard-info">
                        <div class="pcard-line pcard-line--name"></div>
                        <div class="pcard-line pcard-line--course"></div>
                    </div>
                    <div class="heart-icon">💙</div>
                </div>
            </div>
        </div>
    </aside>

    <!-- Right panel: form -->
    <main class="form-panel">
        <slot />
    </main>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&display=swap');

    :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
    :global(body) { font-family: 'Plus Jakarta Sans', sans-serif; }

    :global(:root) {
        --bg:        #F0F2FA;
        --ink:       #0F1624;
        --primary:   #4F46E5;
        --primary-d: #3730A3;
        --primary-l: #EEF2FF;
        --accent:    #7C3AED;
        --cyan:      #06B6D4;
        --muted:     #64748B;
        --border:    rgba(79,70,229,0.15);
        --shadow:    0 8px 40px rgba(79,70,229,0.14), 0 2px 10px rgba(15,22,36,0.05);
        --success:   #16A34A;
        --error:     #DC2626;
    }

    .auth-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    /* ══════════════════════════════════════
       BRAND PANEL
    ══════════════════════════════════════ */
    .brand-panel {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2.5rem;

        /* Vibrant gradient */
        background:
            linear-gradient(
                135deg,
                #2D1B69 0%,
                #4F46E5 35%,
                #7C3AED 60%,
                #0891B2 100%
            );
    }

    /* ── Geometric background elements ── */
    .geo {
        position: absolute;
        pointer-events: none;
    }

    /* Big blurred circle top-left */
    .geo-circle-1 {
        width: 420px; height: 420px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 70%);
        top: -140px; left: -140px;
        animation: slow-drift 20s ease-in-out infinite alternate;
    }

    /* Small blurred circle bottom-right */
    .geo-circle-2 {
        width: 280px; height: 280px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(6,182,212,.25) 0%, transparent 70%);
        bottom: -80px; right: -60px;
        animation: slow-drift 16s ease-in-out infinite alternate-reverse;
    }

    /* Decorative ring 1 */
    .geo-ring-1 {
        width: 300px; height: 300px;
        border-radius: 50%;
        border: 1.5px solid rgba(255,255,255,.1);
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        animation: spin-slow 40s linear infinite;
    }
    .geo-ring-1::before {
        content: '';
        position: absolute;
        width: 8px; height: 8px;
        background: rgba(255,255,255,.5);
        border-radius: 50%;
        top: -4px; left: 50%;
        transform: translateX(-50%);
        box-shadow: 0 0 8px 2px rgba(255,255,255,.3);
    }

    /* Decorative ring 2 */
    .geo-ring-2 {
        width: 180px; height: 180px;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,.07);
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        animation: spin-slow 28s linear infinite reverse;
    }

    /* Dot grid */
    .geo-dot-grid {
        inset: 0;
        background-image: radial-gradient(circle, rgba(255,255,255,.09) 1px, transparent 1px);
        background-size: 28px 28px;
    }

    @keyframes slow-drift {
        from { transform: translate(0, 0); }
        to   { transform: translate(18px, 14px); }
    }
    @keyframes spin-slow {
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    /* ── Brand content ── */
    .brand-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
        width: 100%;
        max-width: 340px;
    }

    /* Logo */
    .brand-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .logo-mark {
        width: 48px; height: 48px;
        border-radius: 14px;
        background: rgba(255,255,255,.15);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,.25);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.4rem;
        box-shadow: 0 4px 16px rgba(0,0,0,.2);
        animation: logo-pulse 3s ease-in-out infinite;
    }
    @keyframes logo-pulse {
        0%,100% { transform: scale(1);    box-shadow: 0 4px 16px rgba(0,0,0,.2); }
        50%     { transform: scale(1.05); box-shadow: 0 6px 24px rgba(0,0,0,.3); }
    }
    .logo-text-wrap { display: flex; flex-direction: column; gap: .05rem; }
    .brand-name {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 2rem; font-weight: 800;
        color: #fff; letter-spacing: -.04em; line-height: 1;
    }
    .brand-version {
        font-size: .6rem; font-weight: 700;
        letter-spacing: .12em; text-transform: uppercase;
        color: rgba(255,255,255,.45);
    }

    /* Headline */
    .brand-copy { display: flex; flex-direction: column; gap: .65rem; }
    .brand-headline {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 2.1rem; font-weight: 800;
        color: #fff; line-height: 1.2;
        letter-spacing: -.03em;
    }
    .brand-headline em {
        font-style: italic; font-weight: 700;
        background: linear-gradient(90deg, #A5F3FC, #67E8F9, #38BDF8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .brand-sub {
        font-size: .88rem; font-weight: 400;
        color: rgba(255,255,255,.55); line-height: 1.6;
    }

    /* Stats strip */
    .stats-row {
        display: flex; align-items: center; gap: 1rem;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 14px;
        padding: .75rem 1.1rem;
        backdrop-filter: blur(6px);
    }
    .stat { display: flex; flex-direction: column; align-items: center; gap: .1rem; flex: 1; }
    .stat-num {
        font-size: .95rem; font-weight: 800;
        color: #fff; line-height: 1;
    }
    .stat-label { font-size: .62rem; font-weight: 500; color: rgba(255,255,255,.5); }
    .stat-sep { width: 1px; height: 28px; background: rgba(255,255,255,.15); }

    /* Profile cards */
    .cards-wrap {
        display: flex; flex-direction: column; gap: .65rem;
    }
    .pcard {
        display: flex; align-items: center; gap: .75rem;
        background: rgba(255,255,255,.1);
        border: 1px solid rgba(255,255,255,.15);
        border-radius: 14px;
        padding: .75rem .9rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0,0,0,.15);
    }
    .pcard--a { animation: card-float 6s ease-in-out infinite; }
    .pcard--b { animation: card-float 6s ease-in-out infinite 1.8s; margin-left: 1.25rem; }
    @keyframes card-float {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-5px); }
    }

    .pcard-avatar {
        width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    }
    .pcard-avatar--a { background: linear-gradient(135deg, #A5F3FC, #38BDF8, #4F46E5); }
    .pcard-avatar--b { background: linear-gradient(135deg, #C4B5FD, #A78BFA, #7C3AED); }

    .pcard-info { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .pcard-line {
        height: 7px; border-radius: 4px;
        background: rgba(255,255,255,.2);
    }
    .pcard-line--name  { width: 70%; }
    .pcard-line--course { width: 45%; }

    .pcard-chip {
        font-size: .62rem; font-weight: 700;
        color: #A5F3FC;
        background: rgba(6,182,212,.2);
        border: 1px solid rgba(6,182,212,.35);
        padding: .22rem .65rem; border-radius: 20px;
        white-space: nowrap;
    }
    .heart-icon { font-size: 1rem; flex-shrink: 0; }

    /* ══════════════════════════════════════
       FORM PANEL
    ══════════════════════════════════════ */
    .form-panel {
        background: var(--bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        overflow-y: auto;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
        .auth-shell { grid-template-columns: 1fr; }
        .brand-panel { display: none; }
        .form-panel { padding: 2rem 1.25rem; min-height: 100vh; }
    }
</style>