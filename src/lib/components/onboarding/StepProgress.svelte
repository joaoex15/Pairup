<!-- $lib/components/onboarding/StepProgress.svelte -->
<script lang="ts">
    export let step: number;
    export let labels: string[];

    $: progress = ((step - 1) / (labels.length - 1)) * 100;
</script>

<div class="wrap" aria-label="Progresso do cadastro">
    <div class="track" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={labels.length}>
        <div class="fill" style="width:{progress}%"></div>
    </div>
    <ol class="dots">
        {#each labels as label, i (i)}
            {@const s = i + 1}
            <li class="dot-wrap" aria-current={s === step ? 'step' : undefined}>
                <div class="dot" class:done={s < step} class:active={s === step}>
                    {#if s < step}
                        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5z"/>
                        </svg>
                    {:else}
                        <span aria-hidden="true">{s}</span>
                    {/if}
                </div>
                <span class="label" class:active={s === step}>{label}</span>
            </li>
        {/each}
    </ol>
</div>

<style>
    .wrap { margin-bottom: 1.5rem; }
    .track { height: 4px; background: rgba(79,70,229,.12); border-radius: 99px; margin-bottom: .7rem; position: relative; overflow: hidden; }
    .fill { position: absolute; left: 0; top: 0; bottom: 0; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 99px; transition: width .4s cubic-bezier(.22,1,.36,1); }
    .dots { display: flex; justify-content: space-between; list-style: none; }
    .dot-wrap { display: flex; flex-direction: column; align-items: center; gap: .28rem; flex: 1; }
    .dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 600; border: 2px solid rgba(100,116,139,.22); color: var(--muted); background: rgba(255,255,255,.6); transition: all .25s; }
    .dot svg { width: 12px; height: 12px; }
    .dot.done { background: var(--primary); border-color: var(--primary); color: #fff; }
    .dot.active { border-color: var(--primary); color: var(--primary); box-shadow: 0 0 0 4px rgba(79,70,229,.1); }
    .label { font-size: .62rem; color: var(--muted); transition: color .2s; }
    .label.active { color: var(--primary); font-weight: 600; }
</style>
