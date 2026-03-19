<script lang="ts">
    import './layout.css';
</script>

<div class="auth-shell">
    <!-- Left panel: brand -->
    <aside class="brand-panel" aria-hidden="true">
        <div class="brand-content">
            <div class="brand-logo">
                <span class="brand-star">✦</span>
                <span class="brand-name">PairUp</span>
            </div>
            <p class="brand-tagline">Encontre sua conexão.<br/>Do seu jeito.</p>

            <!-- Decorative floating cards -->
            <div class="deco-cards">
                <div class="deco-card deco-card--1">
                    <div class="deco-avatar deco-avatar--a"></div>
                    <div class="deco-lines">
                        <div class="deco-line deco-line--long"></div>
                        <div class="deco-line deco-line--short"></div>
                    </div>
                    <div class="deco-badge">✦ Match!</div>
                </div>
                <div class="deco-card deco-card--2">
                    <div class="deco-avatar deco-avatar--b"></div>
                    <div class="deco-lines">
                        <div class="deco-line deco-line--long"></div>
                        <div class="deco-line deco-line--short"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Background blobs -->
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
    </aside>

    <!-- Right panel: form -->
    <main class="form-panel">
        <slot />
    </main>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

    :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
    :global(body) { font-family: 'DM Sans', sans-serif; }

    :global(:root) {
        --cream:     #FAF7F2;
        --ink:       #1A1410;
        --rose:      #D94F6B;
        --rose-pale: #FDE8EE;
        --gold:      #C9A96E;
        --muted:     #8A7F79;
        --border:    rgba(201,169,110,0.22);
        --shadow:    0 8px 40px rgba(217,79,107,0.12), 0 2px 10px rgba(26,20,16,0.05);
    }

    .auth-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    /* ── Brand panel (left) ── */
    .brand-panel {
        background: var(--ink);
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem;
    }

    .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(90px);
        opacity: 0.25;
        pointer-events: none;
    }
    .blob-1 {
        width: 500px; height: 500px;
        background: radial-gradient(circle, #D94F6B, transparent 70%);
        top: -180px; left: -120px;
        animation: drift 18s ease-in-out infinite alternate;
    }
    .blob-2 {
        width: 380px; height: 380px;
        background: radial-gradient(circle, #C9A96E, transparent 70%);
        bottom: -120px; right: -80px;
        animation: drift 22s ease-in-out infinite alternate-reverse;
    }
    @keyframes drift {
        from { transform: translate(0, 0) scale(1); }
        to   { transform: translate(25px, 18px) scale(1.07); }
    }

    .brand-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .brand-logo {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .brand-star {
        font-size: 1.8rem;
        color: var(--rose);
        animation: pulse 3s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%       { transform: scale(1.2); opacity: 0.8; }
    }
    .brand-name {
        font-family: 'Cormorant Garamond', serif;
        font-size: 2.6rem;
        font-weight: 700;
        color: #fff;
        letter-spacing: -0.02em;
    }

    .brand-tagline {
        font-size: 1.05rem;
        font-weight: 300;
        color: rgba(255,255,255,0.55);
        line-height: 1.65;
        max-width: 240px;
    }

    /* Decorative fake profile cards */
    .deco-cards {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
    }
    .deco-card {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 14px;
        padding: 0.85rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        backdrop-filter: blur(6px);
        width: 220px;
    }
    .deco-card--1 { animation: float 6s ease-in-out infinite; }
    .deco-card--2 { animation: float 6s ease-in-out infinite 1.5s; margin-left: 1.5rem; }
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-6px); }
    }

    .deco-avatar {
        width: 36px; height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
    }
    .deco-avatar--a { background: linear-gradient(135deg, #F4B8C8, #D94F6B); }
    .deco-avatar--b { background: linear-gradient(135deg, #C9A96E, #E8C990); }

    .deco-lines { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .deco-line {
        height: 8px; border-radius: 4px;
        background: rgba(255,255,255,0.15);
    }
    .deco-line--long  { width: 80%; }
    .deco-line--short { width: 50%; }

    .deco-badge {
        font-size: 0.65rem;
        font-weight: 600;
        color: var(--rose);
        background: rgba(217,79,107,0.15);
        border: 1px solid rgba(217,79,107,0.3);
        padding: 3px 8px;
        border-radius: 20px;
        white-space: nowrap;
    }

    /* ── Form panel (right) ── */
    .form-panel {
        background: var(--cream);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        overflow-y: auto;
    }

    /* Responsive: stack on small screens */
    @media (max-width: 768px) {
        .auth-shell { grid-template-columns: 1fr; }
        .brand-panel { display: none; }
        .form-panel { padding: 2rem 1.25rem; min-height: 100vh; }
    }
</style>