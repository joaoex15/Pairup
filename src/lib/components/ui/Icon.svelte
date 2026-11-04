<!-- $lib/components/ui/Icon.svelte -->
<script lang="ts">
    import { ICONS, type IconDef, type IconName } from './icons';

    export let name: IconName;
    export let size = 22;
    export let filled = false;
    export let strokeWidth = 2;

    $: icon = ICONS[name] as IconDef;
    $: preenchido = filled || !!icon.fill;
</script>

<svg
    viewBox={icon.viewBox}
    width={size}
    height={size}
    fill={preenchido ? 'currentColor' : 'none'}
    stroke={icon.fill ? 'none' : 'currentColor'}
    stroke-width={strokeWidth}
    aria-hidden="true"
    style="display:block;flex-shrink:0"
>
    <path
        d={icon.d}
        stroke-linecap="round"
        stroke-linejoin="round"
        fill-rule={icon.fill ? 'evenodd' : undefined}
        clip-rule={icon.fill ? 'evenodd' : undefined}
    />
</svg>
