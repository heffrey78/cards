import { describe, it, expect } from 'vitest';
import { DEFAULT_GAME_CONFIG, generateInitialCardPositions, generateCardData } from './gameConfig';

describe('Game Configuration', () => {
	describe('DEFAULT_GAME_CONFIG', () => {
		it('has correct default values', () => {
			expect(DEFAULT_GAME_CONFIG.cardCount).toBe(3);
			expect(DEFAULT_GAME_CONFIG.fieldDimensions).toEqual({ width: 800, height: 600 });
			expect(DEFAULT_GAME_CONFIG.cardDimensions).toEqual({ width: 80, height: 120 });
			expect(DEFAULT_GAME_CONFIG.zIndex).toEqual({ base: 10, drag: 1000 });
		});
	});

	describe('generateInitialCardPositions', () => {
		it('generates correct number of positions', () => {
			const config = { ...DEFAULT_GAME_CONFIG, cardCount: 5 };
			const positions = generateInitialCardPositions(config);
			
			expect(positions).toHaveLength(5);
		});

		it('generates positions within field boundaries', () => {
			const config = { ...DEFAULT_GAME_CONFIG, cardCount: 4 };
			const positions = generateInitialCardPositions(config);
			
			positions.forEach(position => {
				expect(position.x).toBeGreaterThanOrEqual(0);
				expect(position.y).toBeGreaterThanOrEqual(0);
				expect(position.x).toBeLessThanOrEqual(config.fieldDimensions.width - config.cardDimensions.width);
				expect(position.y).toBeLessThanOrEqual(config.fieldDimensions.height - config.cardDimensions.height);
			});
		});

		it('distributes cards in grid layout for multiple cards', () => {
			const config = { ...DEFAULT_GAME_CONFIG, cardCount: 4 };
			const positions = generateInitialCardPositions(config);
			
			// With 4 cards, should be in 2x2 grid
			expect(positions).toHaveLength(4);
			
			// Positions should be different
			const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`));
			expect(uniquePositions.size).toBe(4);
		});

		it('handles single card correctly', () => {
			const config = { ...DEFAULT_GAME_CONFIG, cardCount: 1 };
			const positions = generateInitialCardPositions(config);
			
			expect(positions).toHaveLength(1);
			expect(positions[0]).toEqual({ x: 0, y: 0 });
		});

		it('handles large number of cards', () => {
			const config = { ...DEFAULT_GAME_CONFIG, cardCount: 15 };
			const positions = generateInitialCardPositions(config);
			
			expect(positions).toHaveLength(15);
			
			// All positions should be within bounds
			positions.forEach(position => {
				expect(position.x).toBeGreaterThanOrEqual(0);
				expect(position.y).toBeGreaterThanOrEqual(0);
				expect(position.x).toBeLessThanOrEqual(config.fieldDimensions.width - config.cardDimensions.width);
				expect(position.y).toBeLessThanOrEqual(config.fieldDimensions.height - config.cardDimensions.height);
			});
		});
	});

	describe('generateCardData', () => {
		describe('Classic cards', () => {
			it('generates correct number of classic cards', () => {
				const cards = generateCardData(5, 'classic');
				expect(cards).toHaveLength(5);
				cards.forEach(card => {
					expect(card.cardType).toBe('classic');
				});
			});

			it('cycles through suits and ranks', () => {
				const cards = generateCardData(8, 'classic');
				
				// Type assertions for classic cards
				const classicCards = cards as Array<{cardType: 'classic', suit: string, rank: string}>;
				
				// Check that suits cycle through ♠, ♥, ♦, ♣
				expect(classicCards[0].suit).toBe('♠');
				expect(classicCards[1].suit).toBe('♥');
				expect(classicCards[2].suit).toBe('♦');
				expect(classicCards[3].suit).toBe('♣');
				expect(classicCards[4].suit).toBe('♠'); // Cycle repeats
				
				// Check that ranks cycle through A, 2, 3, etc.
				expect(classicCards[0].rank).toBe('A');
				expect(classicCards[1].rank).toBe('2');
				expect(classicCards[2].rank).toBe('3');
			});

			it('handles large numbers by cycling', () => {
				const cards = generateCardData(60, 'classic'); // More than 52 cards
				
				expect(cards).toHaveLength(60);
				
				// Type assertions for classic cards
				const classicCards = cards as Array<{cardType: 'classic', suit: string, rank: string}>;
				
				// Verify all cards have valid suits and ranks
				classicCards.forEach(card => {
					expect(['♠', '♥', '♦', '♣']).toContain(card.suit);
					expect(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']).toContain(card.rank);
					expect(card.cardType).toBe('classic');
				});
			});

			it('defaults to classic cards when no type specified', () => {
				const cards = generateCardData(3);
				expect(cards).toHaveLength(3);
				
				// Type assertions for classic cards
				const classicCards = cards as Array<{cardType: 'classic', suit: string, rank: string}>;
				classicCards.forEach(card => {
					expect(card.cardType).toBe('classic');
					expect(card.suit).toBeDefined();
					expect(card.rank).toBeDefined();
				});
			});
		});

		describe('CCG cards', () => {
			it('generates correct number of CCG cards', () => {
				const cards = generateCardData(5, 'ccg');
				expect(cards).toHaveLength(5);
				cards.forEach(card => {
					expect(card.cardType).toBe('ccg');
				});
			});

			it('generates CCG cards with required properties', () => {
				const cards = generateCardData(3, 'ccg');
				
				// Type assertions for CCG cards
				const ccgCards = cards as Array<{cardType: 'ccg', name: string, attack: number, health: number, description: string, imageUrl: string}>;
				
				ccgCards.forEach(card => {
					expect(card.cardType).toBe('ccg');
					expect(card.name).toBeDefined();
					expect(typeof card.name).toBe('string');
					expect(card.name.length).toBeGreaterThan(0);
					
					expect(card.attack).toBeDefined();
					expect(typeof card.attack).toBe('number');
					expect(card.attack).toBeGreaterThanOrEqual(0);
					
					expect(card.health).toBeDefined();
					expect(typeof card.health).toBe('number');
					expect(card.health).toBeGreaterThanOrEqual(0);
					
					expect(card.description).toBeDefined();
					expect(typeof card.description).toBe('string');
					expect(card.description.length).toBeGreaterThan(0);
					
					expect(card.imageUrl).toBeDefined();
					expect(typeof card.imageUrl).toBe('string');
					expect(card.imageUrl).toContain('dicebear.com');
				});
			});

			it('cycles through predefined CCG card data', () => {
				const cards = generateCardData(12, 'ccg'); // More than the 10 predefined cards
				
				expect(cards).toHaveLength(12);
				
				// Type assertions for CCG cards
				const ccgCards = cards as Array<{cardType: 'ccg', name: string, attack: number, health: number, description: string, imageUrl: string}>;
				
				// First card should be Flame Warrior
				expect(ccgCards[0].name).toBe('Flame Warrior');
				expect(ccgCards[0].attack).toBe(3);
				expect(ccgCards[0].health).toBe(2);
				expect(ccgCards[0].description).toContain('fierce warrior');
				
				// 11th card should cycle back to first card (Flame Warrior)
				expect(ccgCards[10].name).toBe('Flame Warrior');
				expect(ccgCards[10].attack).toBe(3);
				expect(ccgCards[10].health).toBe(2);
			});

			it('generates unique image URLs for different instances of same card', () => {
				const cards = generateCardData(12, 'ccg');
				
				// Type assertions for CCG cards
				const ccgCards = cards as Array<{cardType: 'ccg', name: string, attack: number, health: number, description: string, imageUrl: string}>;
				
				// First and 11th cards have same name but different image URLs
				expect(ccgCards[0].name).toBe(ccgCards[10].name);
				expect(ccgCards[0].imageUrl).not.toBe(ccgCards[10].imageUrl);
			});

			it('does not have classic card properties', () => {
				const cards = generateCardData(3, 'ccg');
				
				// Type assertions for CCG cards - they should not have suit/rank
				const ccgCards = cards as Array<{cardType: 'ccg', name: string, attack: number, health: number, description: string, imageUrl: string}>;
				
				ccgCards.forEach(card => {
					// CCG cards should not have suit/rank properties
					expect((card as any).suit).toBeUndefined();
					expect((card as any).rank).toBeUndefined();
				});
			});
		});

		describe('Error handling', () => {
			it('generates empty array for zero count', () => {
				const classicCards = generateCardData(0, 'classic');
				const ccgCards = generateCardData(0, 'ccg');
				expect(classicCards).toHaveLength(0);
				expect(ccgCards).toHaveLength(0);
			});

			it('throws error for negative count', () => {
				expect(() => generateCardData(-1, 'classic')).toThrow('Card count must be a non-negative integer');
				expect(() => generateCardData(-1, 'ccg')).toThrow('Card count must be a non-negative integer');
			});

			it('throws error for non-integer count', () => {
				expect(() => generateCardData(3.5, 'classic')).toThrow('Card count must be a non-negative integer');
				expect(() => generateCardData(3.5, 'ccg')).toThrow('Card count must be a non-negative integer');
			});
		});
	});

	describe('generateInitialCardPositions edge cases', () => {
		it('throws error for invalid configuration', () => {
			expect(() => generateInitialCardPositions(null as any)).toThrow('Invalid configuration provided');
			expect(() => generateInitialCardPositions(undefined as any)).toThrow('Invalid configuration provided');
		});

		it('throws error for negative card count', () => {
			const config = { ...DEFAULT_GAME_CONFIG, cardCount: -1 };
			expect(() => generateInitialCardPositions(config)).toThrow('Card count must be a non-negative integer');
		});

		it('throws error for non-integer card count', () => {
			const config = { ...DEFAULT_GAME_CONFIG, cardCount: 2.5 };
			expect(() => generateInitialCardPositions(config)).toThrow('Card count must be a non-negative integer');
		});

		it('returns empty array for zero card count', () => {
			const config = { ...DEFAULT_GAME_CONFIG, cardCount: 0 };
			const positions = generateInitialCardPositions(config);
			expect(positions).toHaveLength(0);
		});
	});
});