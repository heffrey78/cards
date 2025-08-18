<script lang="ts">
	import PlayingField from '$lib/components/PlayingField.svelte';
	import Card from '$lib/components/Card.svelte';

	interface CardState {
		position: { x: number; y: number };
		flipped: boolean;
		suit: string;
		rank: string;
		zIndex: number;
	}

	const BASE_Z_INDEX = 10; // Base z-index for cards on table
	const DRAG_Z_INDEX = 1000; // Z-index during dragging
	
	let cards = $state<CardState[]>([
		{ position: { x: 100, y: 100 }, flipped: false, suit: '♠', rank: 'A', zIndex: BASE_Z_INDEX },
		{ position: { x: 250, y: 150 }, flipped: false, suit: '♥', rank: 'K', zIndex: BASE_Z_INDEX },
		{ position: { x: 400, y: 200 }, flipped: false, suit: '♦', rank: 'Q', zIndex: BASE_Z_INDEX }
	]);

	let highestStackZIndex = $state(BASE_Z_INDEX);
	let draggedCardIndex = $state<number | null>(null);

	function checkCardCollision(card1: CardState, card2: CardState, cardWidth: number = 80, cardHeight: number = 120): boolean {
		const x1 = card1.position.x;
		const y1 = card1.position.y;
		const x2 = card2.position.x;
		const y2 = card2.position.y;
		
		return !(x1 + cardWidth < x2 || x2 + cardWidth < x1 || y1 + cardHeight < y2 || y2 + cardHeight < y1);
	}

	function handleCardDragStart(cardIndex: number) {
		draggedCardIndex = cardIndex;
		// Set dragged card to highest z-index during drag
		cards[cardIndex].zIndex = DRAG_Z_INDEX;
	}

	function handleCardPositionChange(cardIndex: number, newX: number, newY: number) {
		// Boundary checking - keep card within playing field
		const fieldWidth = 800;
		const fieldHeight = 600;
		const cardWidth = 80;
		const cardHeight = 120;

		const constrainedX = Math.max(0, Math.min(newX, fieldWidth - cardWidth));
		const constrainedY = Math.max(0, Math.min(newY, fieldHeight - cardHeight));

		// Update position
		cards[cardIndex].position = { x: constrainedX, y: constrainedY };
	}

	function handleCardDragEnd(cardIndex: number) {
		draggedCardIndex = null;
		const draggedCard = cards[cardIndex];
		let isStacked = false;
		
		// Check for collisions with other cards
		for (let i = 0; i < cards.length; i++) {
			if (i !== cardIndex && checkCardCollision(draggedCard, cards[i])) {
				// Stack the dragged card on top
				draggedCard.zIndex = ++highestStackZIndex;
				isStacked = true;
				break; // Only need to stack on the first collision
			}
		}
		
		// If not stacked, reset to base z-index
		if (!isStacked) {
			draggedCard.zIndex = BASE_Z_INDEX;
		}
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
	<p>Drag one card over another and release to stack them!</p>
	
	<div class="game-container">
		<PlayingField>
			{#each cards as card, index}
				<Card 
					suit={card.suit} 
					rank={card.rank}
					x={card.position.x}
					y={card.position.y}
					flipped={card.flipped}
					zIndex={card.zIndex}
					onPositionChange={(newX, newY) => handleCardPositionChange(index, newX, newY)}
					onFlipChange={(flipped) => handleCardFlipChange(index, flipped)}
					onDragStart={() => handleCardDragStart(index)}
					onDragEnd={() => handleCardDragEnd(index)}
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
