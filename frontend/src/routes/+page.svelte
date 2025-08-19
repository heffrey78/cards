<script lang="ts">
	import PlayingField from '$lib/components/PlayingField.svelte';
	import Card from '$lib/components/Card.svelte';
	import { 
		DEFAULT_GAME_CONFIG, 
		generateInitialCardPositions, 
		generateCardData, 
		generateDeckSections,
		constrainPositionToDeckSection,
		type GameConfig
	} from '$lib/config/gameConfig';

	interface CardState {
		position: { x: number; y: number };
		flipped: boolean;
		cardType: 'classic' | 'ccg';
		deckId: number; // Which deck this card belongs to
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

	// Configuration - can be modified to change deck count and card distribution
	let gameConfig = $state<GameConfig>({ ...DEFAULT_GAME_CONFIG });
	let cardMode = $state<'classic' | 'ccg'>('classic');
	
	// Generate initial card data and positions for all deck sections
	function initializeCards(): CardState[] {
		const allCards: CardState[] = [];
		
		gameConfig.deckSections.forEach((deckSection) => {
			const positions = generateInitialCardPositions(deckSection, gameConfig.cardDimensions);
			const cardData = generateCardData(deckSection.cardCount, cardMode);
			
			cardData.forEach((card, index) => {
				allCards.push({
					position: positions[index],
					flipped: false,
					cardType: card.cardType,
					deckId: deckSection.id,
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
				});
			});
		});
		
		return allCards;
	}
	
	let cards = $state<CardState[]>(initializeCards());

	let highestStackZIndex = $state(gameConfig.zIndex.base);

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
		// Set dragged card to highest z-index during drag
		cards[cardIndex].zIndex = gameConfig.zIndex.drag;
	}

	function handleCardPositionChange(cardIndex: number, newX: number, newY: number) {
		const card = cards[cardIndex];
		const deckSection = gameConfig.deckSections.find(section => section.id === card.deckId);
		
		if (!deckSection) {
			console.error('Deck section not found for card', card.deckId);
			return;
		}
		
		// Constrain position to the card's deck section
		const constrainedPosition = constrainPositionToDeckSection(
			{ x: newX, y: newY },
			deckSection,
			gameConfig.cardDimensions
		);

		// Update position
		cards[cardIndex].position = constrainedPosition;
	}

	function handleCardDragEnd(cardIndex: number) {
		const draggedCard = cards[cardIndex];
		let isStacked = false;
		
		// Check for collisions with other cards in the same deck
		for (let i = 0; i < cards.length; i++) {
			if (i !== cardIndex && 
				cards[i].deckId === draggedCard.deckId && // Only collide with cards in same deck
				checkCardCollision(draggedCard, cards[i])) {
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
	
	function updateDeckCount(newDeckCount: number) {
		if (newDeckCount < 1 || newDeckCount > 2) {
			console.error('Deck count must be 1 or 2');
			return;
		}
		
		gameConfig.deckCount = newDeckCount;
		gameConfig.deckSections = generateDeckSections(newDeckCount, gameConfig.fieldDimensions);
		cards = initializeCards();
		highestStackZIndex = gameConfig.zIndex.base;
	}

	function updateDeckCardCount(deckId: number, newCount: number) {
		if (newCount < 1 || newCount > 15) {
			console.error('Card count must be between 1 and 15');
			return;
		}
		
		const deckSection = gameConfig.deckSections.find(section => section.id === deckId);
		if (!deckSection) {
			console.error('Deck section not found:', deckId);
			return;
		}
		
		// Update the deck section's card count
		deckSection.cardCount = newCount;
		
		// Regenerate all cards to maintain proper distribution
		cards = initializeCards();
		
		// Reset highest z-index
		highestStackZIndex = gameConfig.zIndex.base;
	}
</script>

<svelte:head>
	<title>Card Game Engine</title>
	<meta name="description" content="Interactive card game with drag and drop functionality" />
</svelte:head>

<main>
	<h1>Card Game Engine</h1>
	<p>Click and drag any card to move it around its deck section!</p>
	<p>Double-click any card to flip it over and see the back design.</p>
	<p>Drag one card over another in the same deck and release to stack them!</p>
	<p>Cards are confined to their deck's area and can't move between decks.</p>
	
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
			<label for="deck-count">Number of decks:</label>
			<select 
				id="deck-count"
				bind:value={gameConfig.deckCount}
				onchange={(e) => {
					const target = e.target;
					if (target instanceof HTMLSelectElement) {
						const value = parseInt(target.value, 10);
						if (!isNaN(value) && (value === 1 || value === 2)) {
							updateDeckCount(value);
						}
					}
				}}
			>
				<option value="1">1</option>
				<option value="2">2</option>
			</select>
		</div>
		
		{#each gameConfig.deckSections as deckSection, index}
			<div class="control-group">
				<label for="deck-{deckSection.id}-cards">Deck {deckSection.id + 1} cards:</label>
				<input 
					type="range" 
					id="deck-{deckSection.id}-cards"
					min="1" 
					max="15" 
					bind:value={deckSection.cardCount}
					oninput={(e) => {
						const target = e.target;
						if (target instanceof HTMLInputElement) {
							const value = parseInt(target.value, 10);
							if (!isNaN(value) && value >= 1 && value <= 15) {
								updateDeckCardCount(deckSection.id, value);
							}
						}
					}}
				/>
				<span>{deckSection.cardCount}</span>
			</div>
		{/each}
	</div>
	
	<div class="game-container">
		<PlayingField deckSections={gameConfig.deckSections}>
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
