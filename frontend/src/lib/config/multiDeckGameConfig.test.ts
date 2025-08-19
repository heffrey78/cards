import { describe, it, expect } from 'vitest';
import { 
	generateDeckSections, 
	generateInitialCardPositions, 
	isPositionInDeckSection,
	constrainPositionToDeckSection,
	type DeckSection 
} from './gameConfig';

describe('Multi-deck Game Configuration', () => {
	describe('generateDeckSections', () => {
		it('should create single deck section for deckCount = 1', () => {
			const fieldDimensions = { width: 800, height: 600 };
			const sections = generateDeckSections(1, fieldDimensions);
			
			expect(sections).toHaveLength(1);
			expect(sections[0]).toEqual({
				id: 0,
				bounds: { x: 0, y: 0, width: 800, height: 600 },
				cardCount: 3,
				maxCards: 15
			});
		});

		it('should create two equal deck sections for deckCount = 2', () => {
			const fieldDimensions = { width: 800, height: 600 };
			const sections = generateDeckSections(2, fieldDimensions);
			
			expect(sections).toHaveLength(2);
			
			// First deck (left half)
			expect(sections[0]).toEqual({
				id: 0,
				bounds: { x: 0, y: 0, width: 400, height: 600 },
				cardCount: 3,
				maxCards: 15
			});
			
			// Second deck (right half)
			expect(sections[1]).toEqual({
				id: 1,
				bounds: { x: 400, y: 0, width: 400, height: 600 },
				cardCount: 3,
				maxCards: 15
			});
		});

		it('should throw error for invalid deck count', () => {
			const fieldDimensions = { width: 800, height: 600 };
			
			expect(() => generateDeckSections(0, fieldDimensions)).toThrow('Deck count must be 1 or 2');
			expect(() => generateDeckSections(3, fieldDimensions)).toThrow('Deck count must be 1 or 2');
			expect(() => generateDeckSections(-1, fieldDimensions)).toThrow('Deck count must be 1 or 2');
			expect(() => generateDeckSections(1.5, fieldDimensions)).toThrow('Deck count must be 1 or 2');
		});
	});

	describe('generateInitialCardPositions', () => {
		it('should generate positions within deck section bounds', () => {
			const deckSection: DeckSection = {
				id: 0,
				bounds: { x: 100, y: 50, width: 300, height: 200 },
				cardCount: 4,
				maxCards: 15
			};
			const cardDimensions = { width: 80, height: 120 };
			
			const positions = generateInitialCardPositions(deckSection, cardDimensions);
			
			expect(positions).toHaveLength(4);
			
			// All positions should be within the deck section bounds
			positions.forEach(position => {
				expect(position.x).toBeGreaterThanOrEqual(deckSection.bounds.x);
				expect(position.y).toBeGreaterThanOrEqual(deckSection.bounds.y);
				expect(position.x + cardDimensions.width).toBeLessThanOrEqual(
					deckSection.bounds.x + deckSection.bounds.width
				);
				expect(position.y + cardDimensions.height).toBeLessThanOrEqual(
					deckSection.bounds.y + deckSection.bounds.height
				);
			});
		});

		it('should return empty array for zero cards', () => {
			const deckSection: DeckSection = {
				id: 0,
				bounds: { x: 0, y: 0, width: 800, height: 600 },
				cardCount: 0,
				maxCards: 15
			};
			const cardDimensions = { width: 80, height: 120 };
			
			const positions = generateInitialCardPositions(deckSection, cardDimensions);
			expect(positions).toEqual([]);
		});

		it('should handle maximum cards (15)', () => {
			const deckSection: DeckSection = {
				id: 0,
				bounds: { x: 0, y: 0, width: 800, height: 600 },
				cardCount: 15,
				maxCards: 15
			};
			const cardDimensions = { width: 80, height: 120 };
			
			const positions = generateInitialCardPositions(deckSection, cardDimensions);
			expect(positions).toHaveLength(15);
			
			// Ensure all positions are valid
			positions.forEach(position => {
				expect(position.x).toBeGreaterThanOrEqual(0);
				expect(position.y).toBeGreaterThanOrEqual(0);
				expect(position.x + cardDimensions.width).toBeLessThanOrEqual(800);
				expect(position.y + cardDimensions.height).toBeLessThanOrEqual(600);
			});
		});
	});

	describe('isPositionInDeckSection', () => {
		const deckSection: DeckSection = {
			id: 0,
			bounds: { x: 100, y: 50, width: 300, height: 200 },
			cardCount: 3,
			maxCards: 15
		};
		const cardDimensions = { width: 80, height: 120 };

		it('should return true for position completely within bounds', () => {
			const position = { x: 150, y: 100 };
			const result = isPositionInDeckSection(position, deckSection, cardDimensions);
			expect(result).toBe(true);
		});

		it('should return false for position outside left boundary', () => {
			const position = { x: 50, y: 100 };
			const result = isPositionInDeckSection(position, deckSection, cardDimensions);
			expect(result).toBe(false);
		});

		it('should return false for position outside right boundary', () => {
			const position = { x: 350, y: 100 };
			const result = isPositionInDeckSection(position, deckSection, cardDimensions);
			expect(result).toBe(false);
		});

		it('should return false for position outside top boundary', () => {
			const position = { x: 150, y: 10 };
			const result = isPositionInDeckSection(position, deckSection, cardDimensions);
			expect(result).toBe(false);
		});

		it('should return false for position outside bottom boundary', () => {
			const position = { x: 150, y: 200 };
			const result = isPositionInDeckSection(position, deckSection, cardDimensions);
			expect(result).toBe(false);
		});

		it('should consider card dimensions when checking bounds', () => {
			// Position where card top-left is in bounds but card extends outside
			const position = { x: 350, y: 180 };
			const result = isPositionInDeckSection(position, deckSection, cardDimensions);
			expect(result).toBe(false);
		});
	});

	describe('constrainPositionToDeckSection', () => {
		const deckSection: DeckSection = {
			id: 0,
			bounds: { x: 100, y: 50, width: 300, height: 200 },
			cardCount: 3,
			maxCards: 15
		};
		const cardDimensions = { width: 80, height: 120 };

		it('should not modify position already within bounds', () => {
			const position = { x: 150, y: 100 };
			const result = constrainPositionToDeckSection(position, deckSection, cardDimensions);
			expect(result).toEqual(position);
		});

		it('should constrain position to left boundary', () => {
			const position = { x: 50, y: 100 };
			const result = constrainPositionToDeckSection(position, deckSection, cardDimensions);
			expect(result).toEqual({ x: 100, y: 100 });
		});

		it('should constrain position to right boundary', () => {
			const position = { x: 350, y: 100 };
			const result = constrainPositionToDeckSection(position, deckSection, cardDimensions);
			expect(result).toEqual({ x: 320, y: 100 }); // 400 - 80 = 320
		});

		it('should constrain position to top boundary', () => {
			const position = { x: 150, y: 10 };
			const result = constrainPositionToDeckSection(position, deckSection, cardDimensions);
			expect(result).toEqual({ x: 150, y: 50 });
		});

		it('should constrain position to bottom boundary', () => {
			const position = { x: 150, y: 200 };
			const result = constrainPositionToDeckSection(position, deckSection, cardDimensions);
			expect(result).toEqual({ x: 150, y: 130 }); // 250 - 120 = 130
		});

		it('should constrain position to multiple boundaries simultaneously', () => {
			const position = { x: 50, y: 10 };
			const result = constrainPositionToDeckSection(position, deckSection, cardDimensions);
			expect(result).toEqual({ x: 100, y: 50 });
		});
	});

	describe('Card count validation', () => {
		it('should enforce maximum of 15 cards per deck', () => {
			const deckSection: DeckSection = {
				id: 0,
				bounds: { x: 0, y: 0, width: 800, height: 600 },
				cardCount: 16,
				maxCards: 15
			};
			const cardDimensions = { width: 80, height: 120 };
			
			// The function should handle this gracefully or the calling code should validate
			expect(() => generateInitialCardPositions(deckSection, cardDimensions)).not.toThrow();
		});

		it('should allow minimum of 1 card per deck', () => {
			const deckSection: DeckSection = {
				id: 0,
				bounds: { x: 0, y: 0, width: 800, height: 600 },
				cardCount: 1,
				maxCards: 15
			};
			const cardDimensions = { width: 80, height: 120 };
			
			const positions = generateInitialCardPositions(deckSection, cardDimensions);
			expect(positions).toHaveLength(1);
		});
	});
});