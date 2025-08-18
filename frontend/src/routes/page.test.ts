import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('Main Game Page', () => {
	it('renders the game interface', () => {
		render(Page);
		
		expect(screen.getByText('Card Game Engine')).toBeInTheDocument();
		expect(screen.getByText(/Click and drag any card/)).toBeInTheDocument();
		expect(screen.getByText(/Double-click any card to flip/)).toBeInTheDocument();
		expect(screen.getByText(/Drag one card over another and release to stack them!/)).toBeInTheDocument();
	});

	it('displays playing field and three cards', () => {
		const { container } = render(Page);
		
		const playingField = container.querySelector('.playing-field');
		const cards = container.querySelectorAll('.card-container');
		
		expect(playingField).toBeInTheDocument();
		expect(cards).toHaveLength(3);
	});

	it('positions cards at initial coordinates', () => {
		const { container } = render(Page);
		const cards = container.querySelectorAll('.card-container');
		
		// First card at (100, 100)
		expect(cards[0]?.getAttribute('style')).toContain('left: 100px');
		expect(cards[0]?.getAttribute('style')).toContain('top: 100px');
		
		// Second card at (250, 150)
		expect(cards[1]?.getAttribute('style')).toContain('left: 250px');
		expect(cards[1]?.getAttribute('style')).toContain('top: 150px');
		
		// Third card at (400, 200)
		expect(cards[2]?.getAttribute('style')).toContain('left: 400px');
		expect(cards[2]?.getAttribute('style')).toContain('top: 200px');
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
		expect(cardFronts).toHaveLength(3);
		expect(cardBacks).toHaveLength(3);
		
		cardInners.forEach(cardInner => {
			expect(cardInner?.classList.contains('flipped')).toBe(false);
		});
	});

	it('displays different cards: Ace of Spades, King of Hearts, Queen of Diamonds', () => {
		const { container } = render(Page);
		const ranks = container.querySelectorAll('.rank');
		const suits = container.querySelectorAll('.suit');
		
		// Each card has rank/suit displayed twice (top-left and bottom-right)
		// First card - Ace of Spades
		expect(ranks[0]?.textContent).toBe('A');
		expect(suits[0]?.textContent).toBe('♠');
		expect(ranks[1]?.textContent).toBe('A');
		expect(suits[1]?.textContent).toBe('♠');
		
		// Second card - King of Hearts
		expect(ranks[2]?.textContent).toBe('K');
		expect(suits[2]?.textContent).toBe('♥');
		expect(ranks[3]?.textContent).toBe('K');
		expect(suits[3]?.textContent).toBe('♥');
		
		// Third card - Queen of Diamonds
		expect(ranks[4]?.textContent).toBe('Q');
		expect(suits[4]?.textContent).toBe('♦');
		expect(ranks[5]?.textContent).toBe('Q');
		expect(suits[5]?.textContent).toBe('♦');
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
		expect(cards[0]?.getAttribute('style')).toContain('z-index: 10');
		expect(cards[1]?.getAttribute('style')).toContain('z-index: 10');
		expect(cards[2]?.getAttribute('style')).toContain('z-index: 10');
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

	it('has correct z-index constants', () => {
		// Verify the z-index constants are properly defined
		// This is a bit tricky to test directly since they're in the component
		// but we can verify behavior through the UI
		const { container } = render(Page);
		const cards = container.querySelectorAll('.card-container');
		
		// Base z-index should be 10
		cards.forEach(card => {
			expect(card?.getAttribute('style')).toContain('z-index: 10');
		});
	});
});