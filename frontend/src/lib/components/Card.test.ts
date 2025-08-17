import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Card from './Card.svelte';

describe('Card', () => {
	it('renders with default properties', () => {
		const { container } = render(Card);
		const card = container.querySelector('.card-container');
		
		expect(card).toBeTruthy();
		expect(card?.getAttribute('style')).toContain('left: 0px');
		expect(card?.getAttribute('style')).toContain('top: 0px');
		expect(card?.getAttribute('style')).toContain('width: 80px');
		expect(card?.getAttribute('style')).toContain('height: 120px');
	});

	it('renders with custom position and size', () => {
		const { container } = render(Card, { 
			props: { x: 100, y: 50, width: 90, height: 130 } 
		});
		const card = container.querySelector('.card-container');
		
		expect(card?.getAttribute('style')).toContain('left: 100px');
		expect(card?.getAttribute('style')).toContain('top: 50px');
		expect(card?.getAttribute('style')).toContain('width: 90px');
		expect(card?.getAttribute('style')).toContain('height: 130px');
	});

	it('renders default suit and rank', () => {
		const { container } = render(Card);
		const ranks = container.querySelectorAll('.rank');
		const suits = container.querySelectorAll('.suit');
		
		expect(ranks).toHaveLength(2);
		expect(suits).toHaveLength(2);
		expect(ranks[0]?.textContent).toBe('A');
		expect(suits[0]?.textContent).toBe('♠');
	});

	it('renders custom suit and rank', () => {
		const { container } = render(Card, { 
			props: { suit: '♥', rank: 'K' } 
		});
		const ranks = container.querySelectorAll('.rank');
		const suits = container.querySelectorAll('.suit');
		
		expect(ranks[0]?.textContent).toBe('K');
		expect(suits[0]?.textContent).toBe('♥');
	});

	it('applies red class for hearts and diamonds', () => {
		const { container: heartsContainer } = render(Card, { 
			props: { suit: '♥' } 
		});
		const heartsCard = heartsContainer.querySelector('.card-front');
		expect(heartsCard?.classList.contains('red')).toBe(true);

		const { container: diamondsContainer } = render(Card, { 
			props: { suit: '♦' } 
		});
		const diamondsCard = diamondsContainer.querySelector('.card-front');
		expect(diamondsCard?.classList.contains('red')).toBe(true);
	});

	it('does not apply red class for spades and clubs', () => {
		const { container: spadesContainer } = render(Card, { 
			props: { suit: '♠' } 
		});
		const spadesCard = spadesContainer.querySelector('.card-front');
		expect(spadesCard?.classList.contains('red')).toBe(false);

		const { container: clubsContainer } = render(Card, { 
			props: { suit: '♣' } 
		});
		const clubsCard = clubsContainer.querySelector('.card-front');
		expect(clubsCard?.classList.contains('red')).toBe(false);
	});

	it('applies custom CSS class', () => {
		const { container } = render(Card, { 
			props: { class: 'custom-card' } 
		});
		const card = container.querySelector('.card-front');
		
		expect(card?.classList.contains('custom-card')).toBe(true);
	});

	it('has proper card structure', () => {
		const { container } = render(Card);
		const cardFront = container.querySelector('.card-front');
		const cardBack = container.querySelector('.card-back');
		const topLeft = cardFront?.querySelector('.top-left');
		const center = cardFront?.querySelector('.card-center');
		const bottomRight = cardFront?.querySelector('.bottom-right');
		
		expect(cardFront).toBeTruthy();
		expect(cardBack).toBeTruthy();
		expect(topLeft).toBeTruthy();
		expect(center).toBeTruthy();
		expect(bottomRight).toBeTruthy();
		expect(center?.querySelector('.suit-large')).toBeTruthy();
	});
});