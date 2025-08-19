<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DeckSection } from '$lib/config/gameConfig';

	interface PlayingFieldProps {
		width?: number;
		height?: number;
		class?: string;
		children?: Snippet;
		deckSections?: DeckSection[];
	}

	let { width = 800, height = 600, class: className = '', children, deckSections = [], ...props }: PlayingFieldProps = $props();
</script>

<div 
	class="playing-field {className}" 
	style="width: {width}px; height: {height}px;"
	{...props}
>
	<!-- Deck section boundaries -->
	{#each deckSections as deckSection}
		<div 
			class="deck-section" 
			style="
				left: {deckSection.bounds.x}px;
				top: {deckSection.bounds.y}px;
				width: {deckSection.bounds.width}px;
				height: {deckSection.bounds.height}px;
			"
		>
			<div class="deck-label">Deck {deckSection.id + 1}</div>
		</div>
	{/each}
	
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

	.deck-section {
		position: absolute;
		border: 2px dashed rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		pointer-events: none;
		z-index: 1;
	}

	.deck-label {
		position: absolute;
		top: 8px;
		left: 8px;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: bold;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
	}
</style>