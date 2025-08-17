<script lang="ts">
	import type { Snippet } from 'svelte';

	interface PlayingFieldProps {
		width?: number;
		height?: number;
		class?: string;
		children?: Snippet;
	}

	let { width = 800, height = 600, class: className = '', children, ...props }: PlayingFieldProps = $props();
</script>

<div 
	class="playing-field {className}" 
	style="width: {width}px; height: {height}px;"
	{...props}
>
	{@render children?.()}
</div>

<style>
	.playing-field {
		position: relative;
		background: linear-gradient(135deg, #2d5a27, #4a7c59);
		border: 3px solid #8b4513;
		border-radius: 12px;
		box-shadow: 
			inset 0 2px 4px rgba(0,0,0,0.1),
			0 4px 8px rgba(0,0,0,0.2);
		overflow: hidden;
	}

	.playing-field::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
			radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%);
		pointer-events: none;
	}
</style>