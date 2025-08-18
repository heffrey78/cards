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
 * Generates card data for the specified count
 */
export function generateCardData(count: number) {
	if (count < 0 || !Number.isInteger(count)) {
		throw new Error('Card count must be a non-negative integer');
	}
	
	if (count === 0) {
		return [];
	}
	
	const suits = ['♠', '♥', '♦', '♣'];
	const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	
	const cards = [];
	for (let i = 0; i < count; i++) {
		const suit = suits[i % suits.length];
		const rank = ranks[i % ranks.length];
		cards.push({ suit, rank });
	}
	
	return cards;
}