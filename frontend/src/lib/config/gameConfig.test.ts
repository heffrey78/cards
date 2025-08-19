import { describe, it, expect } from 'vitest';
import { DEFAULT_GAME_CONFIG, generateCardData } from './gameConfig';

describe('Game Configuration', () => {
	describe('DEFAULT_GAME_CONFIG', () => {
		it('has correct default values', () => {
			expect(DEFAULT_GAME_CONFIG.deckCount).toBe(1);
			expect(DEFAULT_GAME_CONFIG.deckSections).toHaveLength(1);
			expect(DEFAULT_GAME_CONFIG.deckSections[0]).toEqual({
				id: 0,
				bounds: { x: 0, y: 0, width: 800, height: 600 },
				cardCount: 3,
				maxCards: 15
			});
			expect(DEFAULT_GAME_CONFIG.fieldDimensions).toEqual({ width: 800, height: 600 });
			expect(DEFAULT_GAME_CONFIG.cardDimensions).toEqual({ width: 80, height: 120 });
			expect(DEFAULT_GAME_CONFIG.zIndex).toEqual({ base: 10, drag: 1000 });
		});
	});

	describe('generateCardData', () => {
		describe('Classic cards', () => {
			it('generates correct number of classic cards', () => {
				const cards = generateCardData(5, 'classic');
				
				expect(cards).toHaveLength(5);
				expect(cards.every(card => card.cardType === 'classic')).toBe(true);
			});

			it('cycles through suits and ranks', () => {
				const cards = generateCardData(8, 'classic');
				
				// First few cards should follow the pattern
				expect(cards[0]).toEqual({ cardType: 'classic', suit: '♠', rank: 'A' });
				expect(cards[1]).toEqual({ cardType: 'classic', suit: '♥', rank: '2' });
				expect(cards[2]).toEqual({ cardType: 'classic', suit: '♦', rank: '3' });
				expect(cards[3]).toEqual({ cardType: 'classic', suit: '♣', rank: '4' });
				expect(cards[4]).toEqual({ cardType: 'classic', suit: '♠', rank: '5' }); // Cycles back to spades
			});

			it('defaults to classic cards when no type specified', () => {
				const cards = generateCardData(3);
				
				expect(cards).toHaveLength(3);
				expect(cards.every(card => card.cardType === 'classic')).toBe(true);
			});
		});

		describe('CCG cards', () => {
			it('generates correct number of CCG cards', () => {
				const cards = generateCardData(5, 'ccg');
				
				expect(cards).toHaveLength(5);
				expect(cards.every(card => card.cardType === 'ccg')).toBe(true);
			});

			it('generates CCG cards with required properties', () => {
				const cards = generateCardData(3, 'ccg');
				
				cards.forEach(card => {
					if (card.cardType === 'ccg') {
						expect(typeof card.name).toBe('string');
						expect(typeof card.attack).toBe('number');
						expect(typeof card.health).toBe('number');
						expect(typeof card.description).toBe('string');
						expect(typeof card.imageUrl).toBe('string');
						expect(card.imageUrl).toMatch(/^https:\/\/api\.dicebear\.com/);
					}
				});
			});

			it('cycles through predefined CCG card data', () => {
				const cards = generateCardData(12, 'ccg'); // More than 10 to test cycling
				
				// Should cycle back to first card
				if (cards[0].cardType === 'ccg' && cards[10].cardType === 'ccg') {
					expect(cards[0].name).toBe(cards[10].name);
					expect(cards[0].attack).toBe(cards[10].attack);
					expect(cards[0].health).toBe(cards[10].health);
				}
			});

			it('generates unique image URLs for different instances of same card', () => {
				const cards = generateCardData(12, 'ccg');
				
				if (cards[0].cardType === 'ccg' && cards[10].cardType === 'ccg') {
					// Same card data but different image URLs due to seeding
					expect(cards[0].imageUrl).not.toBe(cards[10].imageUrl);
				}
			});

			it('does not have classic card properties', () => {
				const cards = generateCardData(3, 'ccg');
				
				cards.forEach(card => {
					expect(card).not.toHaveProperty('suit');
					expect(card).not.toHaveProperty('rank');
				});
			});
		});

		describe('Error handling', () => {
			it('generates empty array for zero count', () => {
				const classicCards = generateCardData(0, 'classic');
				const ccgCards = generateCardData(0, 'ccg');
				
				expect(classicCards).toEqual([]);
				expect(ccgCards).toEqual([]);
			});

			it('throws error for negative count', () => {
				expect(() => generateCardData(-1, 'classic')).toThrow('Card count must be between 0 and 15');
				expect(() => generateCardData(-5, 'ccg')).toThrow('Card count must be between 0 and 15');
			});

			it('throws error for non-integer count', () => {
				expect(() => generateCardData(3.5, 'classic')).toThrow('Card count must be between 0 and 15');
				expect(() => generateCardData(3.5, 'ccg')).toThrow('Card count must be between 0 and 15');
			});

			it('throws error for count exceeding 15', () => {
				expect(() => generateCardData(16, 'classic')).toThrow('Card count must be between 0 and 15');
				expect(() => generateCardData(20, 'ccg')).toThrow('Card count must be between 0 and 15');
			});
		});
	});
});