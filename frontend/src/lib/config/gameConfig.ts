/**
 * Game configuration interface and settings
 */

export interface GameConfig {
	/** Number of cards to display on the playing field */
	cardCount: number;
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
	cardCount: 3,
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
 * Creates initial card positions based on configuration
 */
export function generateInitialCardPositions(config: GameConfig): Array<{ x: number; y: number }> {
	if (!config || typeof config !== 'object') {
		throw new Error('Invalid configuration provided');
	}
	
	const { cardCount, fieldDimensions, cardDimensions } = config;
	
	if (cardCount < 0 || !Number.isInteger(cardCount)) {
		throw new Error('Card count must be a non-negative integer');
	}
	
	if (cardCount === 0) {
		return [];
	}
	
	const positions: Array<{ x: number; y: number }> = [];
	
	// Calculate grid layout for optimal card distribution
	const cols = Math.ceil(Math.sqrt(cardCount));
	const rows = Math.ceil(cardCount / cols);
	
	// Calculate spacing to distribute cards evenly
	const availableWidth = fieldDimensions.width - cardDimensions.width;
	const availableHeight = fieldDimensions.height - cardDimensions.height;
	
	const spacingX = cols > 1 ? availableWidth / (cols - 1) : 0;
	const spacingY = rows > 1 ? availableHeight / (rows - 1) : 0;
	
	for (let i = 0; i < cardCount; i++) {
		const col = i % cols;
		const row = Math.floor(i / cols);
		
		const x = col * spacingX;
		const y = row * spacingY;
		
		positions.push({ x, y });
	}
	
	return positions;
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
	if (count < 0 || !Number.isInteger(count)) {
		throw new Error('Card count must be a non-negative integer');
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