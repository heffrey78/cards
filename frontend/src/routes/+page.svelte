<script lang="ts">
	import PlayingField from '$lib/components/PlayingField.svelte';
	import Card from '$lib/components/Card.svelte';

	interface CardState {
		position: { x: number; y: number };
		flipped: boolean;
		suit: string;
		rank: string;
	}

	let cards = $state<CardState[]>([
		{ position: { x: 100, y: 100 }, flipped: false, suit: '♠', rank: 'A' },
		{ position: { x: 250, y: 150 }, flipped: false, suit: '♥', rank: 'K' },
		{ position: { x: 400, y: 200 }, flipped: false, suit: '♦', rank: 'Q' }
	]);

	function handleCardPositionChange(cardIndex: number, newX: number, newY: number) {
		// Boundary checking - keep card within playing field
		const fieldWidth = 800;
		const fieldHeight = 600;
		const cardWidth = 80;
		const cardHeight = 120;

		const constrainedX = Math.max(0, Math.min(newX, fieldWidth - cardWidth));
		const constrainedY = Math.max(0, Math.min(newY, fieldHeight - cardHeight));

		cards[cardIndex].position = { x: constrainedX, y: constrainedY };
	}

	function handleCardFlipChange(cardIndex: number, flipped: boolean) {
		cards[cardIndex].flipped = flipped;
	}
</script>

<svelte:head>
	<title>Card Game Engine</title>
	<meta name="description" content="Interactive card game with drag and drop functionality" />
</svelte:head>

<main>
	<h1>Card Game Engine</h1>
	<p>Click and drag any card to move it around the playing field!</p>
	<p>Double-click any card to flip it over and see the back design.</p>
	<p>Each card moves and flips independently.</p>
	
	<div class="game-container">
		<PlayingField>
			{#each cards as card, index}
				<Card 
					suit={card.suit} 
					rank={card.rank}
					x={card.position.x}
					y={card.position.y}
					flipped={card.flipped}
					onPositionChange={(newX, newY) => handleCardPositionChange(index, newX, newY)}
					onFlipChange={(flipped) => handleCardFlipChange(index, flipped)}
				/>
			{/each}
		</PlayingField>
	</div>
</main>

<style>
	main {
		padding: 2rem;
		text-align: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		color: #333;
	}

	p {
		font-size: 1.1rem;
		margin-bottom: 2rem;
		color: #666;
	}

	.game-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
	}
</style>
