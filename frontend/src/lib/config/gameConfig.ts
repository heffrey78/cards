/**
 * Game configuration interface and settings
 */

export interface DeckSection {
	/** Deck identifier */
	id: number;
	/** Section boundaries within the playing field */
	bounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	/** Cards assigned to this deck */
	cardCount: number;
	/** Maximum cards allowed in this deck (1-15) */
	maxCards: number;
}

export interface GameConfig {
	/** Number of decks (1-2) */
	deckCount: number;
	/** Deck sections configuration */
	deckSections: DeckSection[];
	/** Playing field dimensions */
	fieldDimensions: {
		width: number;
		height: number;
	};
	/** Card dimensions */
	cardDimensions: {
		width: number;
		height: number;
	};
	/** Z-index configuration */
	zIndex: {
		base: number;
		drag: number;
	};
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
	deckCount: 1,
	deckSections: [
		{
			id: 0,
			bounds: { x: 0, y: 0, width: 800, height: 600 },
			cardCount: 3,
			maxCards: 15
		}
	],
	fieldDimensions: {
		width: 800,
		height: 600
	},
	cardDimensions: {
		width: 80,
		height: 120
	},
	zIndex: {
		base: 10,
		drag: 1000
	}
};

/**
 * Creates deck sections based on deck count
 */
export function generateDeckSections(deckCount: number, fieldDimensions: { width: number; height: number }): DeckSection[] {
	if (deckCount < 1 || deckCount > 2 || !Number.isInteger(deckCount)) {
		throw new Error('Deck count must be 1 or 2');
	}
	
	const sections: DeckSection[] = [];
	
	if (deckCount === 1) {
		// Single deck takes the entire field
		sections.push({
			id: 0,
			bounds: { x: 0, y: 0, width: fieldDimensions.width, height: fieldDimensions.height },
			cardCount: 3,
			maxCards: 15
		});
	} else {
		// Two decks split the field vertically
		const halfWidth = fieldDimensions.width / 2;
		
		sections.push({
			id: 0,
			bounds: { x: 0, y: 0, width: halfWidth, height: fieldDimensions.height },
			cardCount: 3,
			maxCards: 15
		});
		
		sections.push({
			id: 1,
			bounds: { x: halfWidth, y: 0, width: halfWidth, height: fieldDimensions.height },
			cardCount: 3,
			maxCards: 15
		});
	}
	
	return sections;
}

/**
 * Creates initial card positions for a specific deck section
 */
export function generateInitialCardPositions(deckSection: DeckSection, cardDimensions: { width: number; height: number }): Array<{ x: number; y: number }> {
	if (!deckSection || typeof deckSection !== 'object') {
		throw new Error('Invalid deck section provided');
	}
	
	const { cardCount, bounds } = deckSection;
	
	if (cardCount < 0 || !Number.isInteger(cardCount)) {
		throw new Error('Card count must be a non-negative integer');
	}
	
	if (cardCount === 0) {
		return [];
	}
	
	const positions: Array<{ x: number; y: number }> = [];
	
	// Calculate grid layout for optimal card distribution within the deck section
	const cols = Math.ceil(Math.sqrt(cardCount));
	const rows = Math.ceil(cardCount / cols);
	
	// Calculate spacing to distribute cards evenly within the section bounds
	const availableWidth = bounds.width - cardDimensions.width;
	const availableHeight = bounds.height - cardDimensions.height;
	
	const spacingX = cols > 1 ? availableWidth / (cols - 1) : 0;
	const spacingY = rows > 1 ? availableHeight / (rows - 1) : 0;
	
	for (let i = 0; i < cardCount; i++) {
		const col = i % cols;
		const row = Math.floor(i / cols);
		
		const x = bounds.x + (col * spacingX);
		const y = bounds.y + (row * spacingY);
		
		positions.push({ x, y });
	}
	
	return positions;
}

/**
 * Checks if a position is within a deck section's bounds
 */
export function isPositionInDeckSection(position: { x: number; y: number }, deckSection: DeckSection, cardDimensions: { width: number; height: number }): boolean {
	const { bounds } = deckSection;
	
	return (
		position.x >= bounds.x &&
		position.x + cardDimensions.width <= bounds.x + bounds.width &&
		position.y >= bounds.y &&
		position.y + cardDimensions.height <= bounds.y + bounds.height
	);
}

/**
 * Constrains a position to stay within a deck section's bounds
 */
export function constrainPositionToDeckSection(position: { x: number; y: number }, deckSection: DeckSection, cardDimensions: { width: number; height: number }): { x: number; y: number } {
	const { bounds } = deckSection;
	
	const constrainedX = Math.max(
		bounds.x,
		Math.min(position.x, bounds.x + bounds.width - cardDimensions.width)
	);
	
	const constrainedY = Math.max(
		bounds.y,
		Math.min(position.y, bounds.y + bounds.height - cardDimensions.height)
	);
	
	return { x: constrainedX, y: constrainedY };
}

/**
 * CCG card data for random generation
 */
const CCG_CARD_DATA = [
	{ name: 'Flame Warrior', attack: 3, health: 2, description: 'A fierce warrior wielding flames of destruction.' },
	{ name: 'Crystal Guardian', attack: 1, health: 4, description: 'Ancient protector of the crystal realm.' },
	{ name: 'Shadow Assassin', attack: 4, health: 1, description: 'Strikes from the darkness with deadly precision.' },
	{ name: 'Thunder Mage', attack: 2, health: 3, description: 'Commands the power of lightning and storm.' },
	{ name: 'Stone Golem', attack: 1, health: 5, description: 'Massive construct of living rock and earth.' },
	{ name: 'Wind Dancer', attack: 3, health: 2, description: 'Swift and graceful, one with the breeze.' },
	{ name: 'Frost Elemental', attack: 2, health: 3, description: 'Embodiment of winter\'s bitter cold.' },
	{ name: 'Solar Phoenix', attack: 4, health: 2, description: 'Reborn from ashes in blazing glory.' },
	{ name: 'Void Walker', attack: 3, health: 3, description: 'Traveler between dimensions and realities.' },
	{ name: 'Nature Spirit', attack: 2, health: 4, description: 'Guardian of the ancient forest wisdom.' }
];

/**
 * Generates GitHub avatar-style image URL
 */
function generateAvatarUrl(seed: string): string {
	// Generate a random background color in hex format
	const colors = ['ff6b6b', '4ecdc4', '45b7d1', 'f9ca24', '6c5ce7', 'a0e7e5', 'feca57', 'ff9ff3', '54a0ff', 'fc427b'];
	const randomColor = colors[Math.abs(seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
	
	return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${randomColor}`;
}

/**
 * Card data types
 */
export interface ClassicCardData {
	cardType: 'classic';
	suit: string;
	rank: string;
}

export interface CCGCardData {
	cardType: 'ccg';
	name: string;
	attack: number;
	health: number;
	description: string;
	imageUrl: string;
}

export type CardData = ClassicCardData | CCGCardData;

/**
 * Generates card data for the specified count and type
 */
export function generateCardData(count: number, cardType: 'classic' | 'ccg' = 'classic'): CardData[] {
	if (count < 0 || count > 15 || !Number.isInteger(count)) {
		throw new Error('Card count must be between 0 and 15');
	}
	
	if (count === 0) {
		return [];
	}
	
	if (cardType === 'classic') {
		const suits = ['♠', '♥', '♦', '♣'];
		const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
		
		const cards: ClassicCardData[] = [];
		for (let i = 0; i < count; i++) {
			const suit = suits[i % suits.length];
			const rank = ranks[i % ranks.length];
			cards.push({ cardType: 'classic', suit, rank });
		}
		
		return cards;
	} else {
		const cards: CCGCardData[] = [];
		for (let i = 0; i < count; i++) {
			const cardData = CCG_CARD_DATA[i % CCG_CARD_DATA.length];
			const imageUrl = generateAvatarUrl(`${cardData.name}-${i}`);
			cards.push({ 
				cardType: 'ccg',
				name: cardData.name,
				attack: cardData.attack,
				health: cardData.health,
				description: cardData.description,
				imageUrl
			});
		}
		
		return cards;
	}
}