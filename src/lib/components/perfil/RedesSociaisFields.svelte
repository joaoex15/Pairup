<!-- $lib/components/perfil/RedesSociaisFields.svelte -->
<script lang="ts">
    import InputField from '$lib/components/ui/InputField.svelte';
    import { mascaraWhatsApp } from '$lib/utils/mascaras';

    export let instagram = '';
    export let whatsapp = '';
    export let telegram = '';
</script>

<div class="social">
    <span class="icon" aria-hidden="true">📷</span>
    <InputField label="Instagram" placeholder="@usuario" bind:value={instagram} autocomplete="off" />
</div>
<div class="social">
    <span class="icon icon--green" aria-hidden="true">💬</span>
    <InputField type="tel" label="WhatsApp" placeholder="(00) 00000-0000" bind:value={whatsapp}
        mask={mascaraWhatsApp} maxlength={15} autocomplete="tel" />
</div>
<div class="social">
    <span class="icon icon--blue" aria-hidden="true">✈️</span>
    <InputField label="Telegram" placeholder="@usuario" bind:value={telegram} autocomplete="off" />
</div>

<style>
    .social { display: grid; grid-template-columns: 2.4rem 1fr; gap: .5rem; align-items: end; }
    .icon { width: 2.4rem; height: 2.4rem; border-radius: 9px; background: rgba(100,116,139,.1); display: flex; align-items: center; justify-content: center; margin-bottom: .55rem; font-size: 1.1rem; }
    .icon--green { background: rgba(37,211,102,.1); }
    .icon--blue  { background: rgba(0,136,204,.1); }
</style>
