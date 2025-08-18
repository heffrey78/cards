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
		it('generates correct number of cards', () => {
			const cards = generateCardData(5);
			expect(cards).toHaveLength(5);
		});

		it('cycles through suits and ranks', () => {
			const cards = generateCardData(8);
			
			// Check that suits cycle through ♠, ♥, ♦, ♣
			expect(cards[0].suit).toBe('♠');
			expect(cards[1].suit).toBe('♥');
			expect(cards[2].suit).toBe('♦');
			expect(cards[3].suit).toBe('♣');
			expect(cards[4].suit).toBe('♠'); // Cycle repeats
			
			// Check that ranks cycle through A, 2, 3, etc.
			expect(cards[0].rank).toBe('A');
			expect(cards[1].rank).toBe('2');
			expect(cards[2].rank).toBe('3');
		});

		it('handles large numbers by cycling', () => {
			const cards = generateCardData(60); // More than 52 cards
			
			expect(cards).toHaveLength(60);
			
			// Verify all cards have valid suits and ranks
			cards.forEach(card => {
				expect(['♠', '♥', '♦', '♣']).toContain(card.suit);
				expect(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']).toContain(card.rank);
			});
		});

		it('generates empty array for zero count', () => {
			const cards = generateCardData(0);
			expect(cards).toHaveLength(0);
		});

		it('throws error for negative count', () => {
			expect(() => generateCardData(-1)).toThrow('Card count must be a non-negative integer');
		});

		it('throws error for non-integer count', () => {
			expect(() => generateCardData(3.5)).toThrow('Card count must be a non-negative integer');
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