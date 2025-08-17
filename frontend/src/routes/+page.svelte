<script lang="ts">
	import PlayingField from '$lib/components/PlayingField.svelte';
	import Card from '$lib/components/Card.svelte';

	let cardPosition = $state({ x: 100, y: 100 });
	let cardFlipped = $state(false);

	function handleCardPositionChange(newX: number, newY: number) {
		// Boundary checking - keep card within playing field
		const fieldWidth = 800;
		const fieldHeight = 600;
		const cardWidth = 80;
		const cardHeight = 120;

		const constrainedX = Math.max(0, Math.min(newX, fieldWidth - cardWidth));
		const constrainedY = Math.max(0, Math.min(newY, fieldHeight - cardHeight));

		cardPosition = { x: constrainedX, y: constrainedY };
	}

	function handleCardFlipChange(flipped: boolean) {
		cardFlipped = flipped;
	}
</script>

<svelte:head>
	<title>Card Game Engine</title>
	<meta name="description" content="Interactive card game with drag and drop functionality" />
</svelte:head>

<main>
	<h1>Card Game Engine</h1>
	<p>Click and drag the card to move it around the playing field!</p>
	<p>Double-click the card to flip it over and see the back design.</p>
	
	<div class="game-container">
		<PlayingField>
			<Card 
				suit="♠" 
				rank="A"
				x={cardPosition.x}
				y={cardPosition.y}
				flipped={cardFlipped}
				onPositionChange={handleCardPositionChange}
				onFlipChange={handleCardFlipChange}
			/>
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
