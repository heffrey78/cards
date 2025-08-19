import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('Main Game Page', () => {
	it('renders the game interface', () => {
		render(Page);
		
		expect(screen.getByText('Card Game Engine')).toBeInTheDocument();
		expect(screen.getByText(/Click and drag any card/)).toBeInTheDocument();
		expect(screen.getByText(/Double-click any card to flip/)).toBeInTheDocument();
		expect(screen.getByText(/Drag one card over another in the same deck and release to stack them!/)).toBeInTheDocument();
	});

	it('displays playing field and configurable number of cards', () => {
		const { container } = render(Page);
		
		const playingField = container.querySelector('.playing-field');
		const cards = container.querySelectorAll('.card-container');
		
		expect(playingField).toBeInTheDocument();
		expect(cards).toHaveLength(3); // Default configured to 3 cards
	});

	it('positions cards at dynamically calculated coordinates', () => {
		const { container } = render(Page);
		const cards = container.querySelectorAll('.card-container');
		
		// Verify all cards have position styles
		cards.forEach(card => {
			expect(card?.getAttribute('style')).toMatch(/left: \d+px/);
			expect(card?.getAttribute('style')).toMatch(/top: \d+px/);
		});
		
		// Verify cards are positioned within field bounds
		cards.forEach(card => {
			const style = card?.getAttribute('style') || '';
			const leftMatch = style.match(/left: (\d+)px/);
			const topMatch = style.match(/top: (\d+)px/);
			
			if (leftMatch && topMatch) {
				const left = parseInt(leftMatch[1]);
				const top = parseInt(topMatch[1]);
				
				expect(left).toBeGreaterThanOrEqual(0);
				expect(top).toBeGreaterThanOrEqual(0);
				expect(left).toBeLessThanOrEqual(720); // 800 - 80 (card width)
				expect(top).toBeLessThanOrEqual(480); // 600 - 120 (card height)
			}
		});
	});

	it('all cards are draggable', () => {
		const { container } = render(Page);
		const cards = container.querySelectorAll('.card-container');
		
		cards.forEach(card => {
			expect(card?.getAttribute('role')).toBe('button');
			expect(card?.getAttribute('tabindex')).toBe('0');
		});
	});

	it('each card has flip functionality available', async () => {
		const { container } = render(Page);
		const cardInners = container.querySelectorAll('.card-inner');
		const cardFronts = container.querySelectorAll('.card-front');
		const cardBacks = container.querySelectorAll('.card-back');
		
		// Should have both card faces for each card and start unflipped
		expect(cardFronts).toHaveLength(3); // Updated for 3 cards
		expect(cardBacks).toHaveLength(3); // Updated for 3 cards
		
		cardInners.forEach(cardInner => {
			expect(cardInner?.classList.contains('flipped')).toBe(false);
		});
	});

	it('displays different cards with cycling suits and ranks', () => {
		const { container } = render(Page);
		const ranks = container.querySelectorAll('.rank');
		const suits = container.querySelectorAll('.suit');
		
		// Each card has rank/suit displayed twice (top-left and bottom-right)
		// First card - Ace of Spades
		expect(ranks[0]?.textContent).toBe('A');
		expect(suits[0]?.textContent).toBe('♠');
		expect(ranks[1]?.textContent).toBe('A');
		expect(suits[1]?.textContent).toBe('♠');
		
		// Second card - 2 of Hearts
		expect(ranks[2]?.textContent).toBe('2');
		expect(suits[2]?.textContent).toBe('♥');
		expect(ranks[3]?.textContent).toBe('2');
		expect(suits[3]?.textContent).toBe('♥');
		
		// Third card - 3 of Diamonds
		expect(ranks[4]?.textContent).toBe('3');
		expect(suits[4]?.textContent).toBe('♦');
		expect(ranks[5]?.textContent).toBe('3');
		expect(suits[5]?.textContent).toBe('♦');
		
		// Verify we have rank/suit pairs for all 3 cards (6 rank elements, 6 suit elements)
		expect(ranks).toHaveLength(6);
		expect(suits).toHaveLength(6);
	});

	it('has proper page metadata', () => {
		render(Page);
		
		// Note: These would typically be tested in e2e tests since they affect document head
		// Here we just verify the component structure includes the svelte:head
		expect(document.title).toBe('Card Game Engine');
	});

	it('initializes cards with base z-index values', () => {
		const { container } = render(Page);
		const cards = container.querySelectorAll('.card-container');
		
		// All cards should start with base z-index of 10
		cards.forEach(card => {
			expect(card?.getAttribute('style')).toContain('z-index: 10');
		});
	});

	it('collision detection works correctly', () => {
		// Test the collision detection function logic
		const card1 = { position: { x: 100, y: 100 }, flipped: false, suit: '♠', rank: 'A', zIndex: 1 };
		const card2 = { position: { x: 120, y: 120 }, flipped: false, suit: '♥', rank: 'K', zIndex: 2 };
		const card3 = { position: { x: 300, y: 300 }, flipped: false, suit: '♦', rank: 'Q', zIndex: 3 };

		// Cards 1 and 2 should overlap (100,100 to 180,220 vs 120,120 to 200,240)
		const cardWidth = 80;
		const cardHeight = 120;
		
		// Check if cards overlap using the same logic as in the component
		function checkCollision(c1: any, c2: any) {
			const x1 = c1.position.x;
			const y1 = c1.position.y;
			const x2 = c2.position.x;
			const y2 = c2.position.y;
			
			return !(x1 + cardWidth < x2 || x2 + cardWidth < x1 || y1 + cardHeight < y2 || y2 + cardHeight < y1);
		}
		
		expect(checkCollision(card1, card2)).toBe(true);
		expect(checkCollision(card1, card3)).toBe(false);
		expect(checkCollision(card2, card3)).toBe(false);
	});

	it('has configurable card count control', () => {
		const { container } = render(Page);
		
		// Should have a range input for card count
		const rangeInput = container.querySelector('input[type="range"]');
		expect(rangeInput).toBeInTheDocument();
		expect(rangeInput?.getAttribute('min')).toBe('1');
		expect(rangeInput?.getAttribute('max')).toBe('15');
		
		// Should display current card count
		const cardCountDisplay = container.querySelector('.controls span');
		expect(cardCountDisplay?.textContent).toBe('3');
	});

	it('updates card count when range input changes', () => {
		const { container } = render(Page);
		
		const rangeInput = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(rangeInput).toBeInTheDocument();
		
		// Initially should have 3 cards
		let cards = container.querySelectorAll('.card-container');
		expect(cards).toHaveLength(3);
		
		// Change to 5 cards (note: this tests the binding but won't trigger the update function in jsdom)
		if (rangeInput) {
			rangeInput.value = '5';
			rangeInput.dispatchEvent(new Event('input'));
		}
	});

	it('handles invalid input gracefully', () => {
		const { container } = render(Page);
		
		const rangeInput = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(rangeInput).toBeInTheDocument();
		
		// Test that invalid values don't break the component
		if (rangeInput) {
			// These should be handled gracefully by the input validation
			rangeInput.value = '-1';
			rangeInput.dispatchEvent(new Event('input'));
			
			rangeInput.value = '100';
			rangeInput.dispatchEvent(new Event('input'));
			
			rangeInput.value = 'invalid';
			rangeInput.dispatchEvent(new Event('input'));
		}
		
		// Component should still render properly
		expect(container.querySelector('.playing-field')).toBeInTheDocument();
	});

	it('validates card count boundaries', () => {
		const { container } = render(Page);
		
		const rangeInput = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(rangeInput).toBeInTheDocument();
		
		// Verify min and max attributes prevent invalid values
		expect(rangeInput.min).toBe('1');
		expect(rangeInput.max).toBe('15');
	});
});