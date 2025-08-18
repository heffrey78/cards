<script lang="ts">
	import PlayingField from '$lib/components/PlayingField.svelte';
	import Card from '$lib/components/Card.svelte';
	import { DEFAULT_GAME_CONFIG, generateInitialCardPositions, generateCardData, type GameConfig, type CardData } from '$lib/config/gameConfig';

	interface CardState {
		position: { x: number; y: number };
		flipped: boolean;
		cardType: 'classic' | 'ccg';
		// Classic card properties
		suit?: string;
		rank?: string;
		// CCG card properties
		name?: string;
		attack?: number;
		health?: number;
		description?: string;
		imageUrl?: string;
		zIndex: number;
	}

	// Configuration - can be modified to change card count
	let gameConfig = $state<GameConfig>({ ...DEFAULT_GAME_CONFIG, cardCount: 5 });
	let cardMode = $state<'classic' | 'ccg'>('classic');
	
	// Generate initial card data and positions
	function initializeCards(): CardState[] {
		const positions = generateInitialCardPositions(gameConfig);
		const cardData = generateCardData(gameConfig.cardCount, cardMode);
		
		return cardData.map((card, index) => ({
			position: positions[index],
			flipped: false,
			cardType: card.cardType,
			// Classic properties
			suit: card.cardType === 'classic' ? card.suit : undefined,
			rank: card.cardType === 'classic' ? card.rank : undefined,
			// CCG properties
			name: card.cardType === 'ccg' ? card.name : undefined,
			attack: card.cardType === 'ccg' ? card.attack : undefined,
			health: card.cardType === 'ccg' ? card.health : undefined,
			description: card.cardType === 'ccg' ? card.description : undefined,
			imageUrl: card.cardType === 'ccg' ? card.imageUrl : undefined,
			zIndex: gameConfig.zIndex.base
		}));
	}
	
	let cards = $state<CardState[]>(initializeCards());

	let highestStackZIndex = $state(gameConfig.zIndex.base);
	let draggedCardIndex = $state<number | null>(null);

	function checkCardCollision(card1: CardState, card2: CardState): boolean {
		const cardWidth = gameConfig.cardDimensions.width;
		const cardHeight = gameConfig.cardDimensions.height;
		const x1 = card1.position.x;
		const y1 = card1.position.y;
		const x2 = card2.position.x;
		const y2 = card2.position.y;
		
		return !(x1 + cardWidth < x2 || x2 + cardWidth < x1 || y1 + cardHeight < y2 || y2 + cardHeight < y1);
	}

	function handleCardDragStart(cardIndex: number) {
		draggedCardIndex = cardIndex;
		// Set dragged card to highest z-index during drag
		cards[cardIndex].zIndex = gameConfig.zIndex.drag;
	}

	function handleCardPositionChange(cardIndex: number, newX: number, newY: number) {
		// Boundary checking - keep card within playing field
		const fieldWidth = gameConfig.fieldDimensions.width;
		const fieldHeight = gameConfig.fieldDimensions.height;
		const cardWidth = gameConfig.cardDimensions.width;
		const cardHeight = gameConfig.cardDimensions.height;

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
			draggedCard.zIndex = gameConfig.zIndex.base;
		}
	}

	function handleCardFlipChange(cardIndex: number, flipped: boolean) {
		cards[cardIndex].flipped = flipped;
	}

	function switchCardMode(newMode: 'classic' | 'ccg') {
		cardMode = newMode;
		cards = initializeCards();
		highestStackZIndex = gameConfig.zIndex.base;
	}

	function updateCardCount(newCount: number) {
		const oldCount = gameConfig.cardCount;
		gameConfig.cardCount = newCount;
		
		if (newCount > oldCount) {
			// Add new cards while preserving existing ones
			const newPositions = generateInitialCardPositions(gameConfig);
			const newCardData = generateCardData(newCount, cardMode);
			
			// Update existing card positions for new layout
			cards.forEach((card, index) => {
				if (index < newPositions.length) {
					card.position = newPositions[index];
				}
			});
			
			// Add new cards
			for (let i = oldCount; i < newCount; i++) {
				const cardData = newCardData[i];
				cards.push({
					position: newPositions[i],
					flipped: false,
					cardType: cardData.cardType,
					suit: cardData.cardType === 'classic' ? cardData.suit : undefined,
					rank: cardData.cardType === 'classic' ? cardData.rank : undefined,
					name: cardData.cardType === 'ccg' ? cardData.name : undefined,
					attack: cardData.cardType === 'ccg' ? cardData.attack : undefined,
					health: cardData.cardType === 'ccg' ? cardData.health : undefined,
					description: cardData.cardType === 'ccg' ? cardData.description : undefined,
					imageUrl: cardData.cardType === 'ccg' ? cardData.imageUrl : undefined,
					zIndex: gameConfig.zIndex.base
				});
			}
		} else if (newCount < oldCount) {
			// Remove excess cards and update positions
			cards = cards.slice(0, newCount);
			
			// Recalculate positions for remaining cards
			const newPositions = generateInitialCardPositions(gameConfig);
			cards.forEach((card, index) => {
				card.position = newPositions[index];
			});
		}
		
		// Reset highest z-index if no cards are stacked above base level
		const maxZIndex = Math.max(...cards.map(card => card.zIndex));
		if (maxZIndex <= gameConfig.zIndex.base) {
			highestStackZIndex = gameConfig.zIndex.base;
		}
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
	
	<div class="controls">
		<div class="control-group">
			<label for="card-mode">Card Type:</label>
			<select 
				id="card-mode"
				bind:value={cardMode}
				onchange={() => switchCardMode(cardMode)}
			>
				<option value="classic">Classic</option>
				<option value="ccg">CCG</option>
			</select>
		</div>
		
		<div class="control-group">
			<label for="card-count">Number of cards:</label>
			<input 
				type="range" 
				id="card-count"
				min="1" 
				max="15" 
				bind:value={gameConfig.cardCount}
				oninput={(e) => {
					const target = e.target;
					if (target instanceof HTMLInputElement) {
						const value = parseInt(target.value, 10);
						if (!isNaN(value) && value >= 1 && value <= 15) {
							updateCardCount(value);
						}
					}
				}}
			/>
			<span>{gameConfig.cardCount}</span>
		</div>
	</div>
	
	<div class="game-container">
		<PlayingField>
			{#each cards as card, index}
				<Card 
					cardType={card.cardType}
					suit={card.suit} 
					rank={card.rank}
					name={card.name}
					attack={card.attack}
					health={card.health}
					description={card.description}
					imageUrl={card.imageUrl}
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

	.controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.controls label {
		font-weight: 500;
		color: #333;
	}

	.controls input[type="range"] {
		flex: 1;
		min-width: 150px;
	}

	.controls select {
		padding: 0.25rem 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: white;
		font-size: 0.9rem;
	}

	.controls span {
		font-weight: bold;
		color: #555;
		min-width: 2rem;
		text-align: center;
	}

	.game-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
	}
</style>
