<!-- $lib/components/ui/Alert.svelte -->
<script lang="ts">
    import Icon from './Icon.svelte';
    import type { IconName } from './icons';

    export let tone: 'success' | 'error' | 'info' = 'error';

    const ICONE: Record<typeof tone, IconName> = { success: 'check', error: 'alert', info: 'info' };
</script>

<div class="alert alert--{tone}" role={tone === 'error' ? 'alert' : 'status'}>
    <Icon name={ICONE[tone]} size={16} />
    <span><slot /></span>
</div>

<style>
    .alert { display: flex; align-items: flex-start; gap: .5rem; font-size: .8rem; line-height: 1.5; padding: .65rem .9rem; border-radius: 10px; margin-bottom: .85rem; }
    .alert--success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }
    .alert--error   { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; animation: shake .35s ease; }
    .alert--info    { background: rgba(79,70,229,.06); border: 1px solid rgba(79,70,229,.18); color: var(--primary); }
    @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
</style>
