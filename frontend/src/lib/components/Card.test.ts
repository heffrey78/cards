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

	describe('CCG card type', () => {
		it('renders CCG card with name, attack, and health', () => {
			const { container } = render(Card, { 
				props: { 
					cardType: 'ccg',
					name: 'Flame Warrior',
					attack: 3,
					health: 2,
					description: 'A fierce warrior',
					imageUrl: 'https://example.com/image.png'
				} 
			});
			
			const cardFront = container.querySelector('.card-front');
			expect(cardFront?.classList.contains('ccg')).toBe(true);
			
			const nameElement = container.querySelector('.ccg-name');
			expect(nameElement?.textContent).toBe('Flame Warrior');
			
			const attackElement = container.querySelector('.attack');
			expect(attackElement?.textContent).toBe('3');
			
			const healthElement = container.querySelector('.health');
			expect(healthElement?.textContent).toBe('2');
		});

		it('renders CCG card description', () => {
			const description = 'A fierce warrior wielding flames of destruction.';
			const { container } = render(Card, { 
				props: { 
					cardType: 'ccg',
					name: 'Flame Warrior',
					description
				} 
			});
			
			const descriptionElement = container.querySelector('.ccg-description');
			expect(descriptionElement?.textContent).toBe(description);
		});

		it('renders CCG card image', () => {
			const imageUrl = 'https://example.com/flame-warrior.png';
			const { container } = render(Card, { 
				props: { 
					cardType: 'ccg',
					name: 'Flame Warrior',
					imageUrl
				} 
			});
			
			const imageElement = container.querySelector('.ccg-image img');
			expect(imageElement?.getAttribute('src')).toBe(imageUrl);
			expect(imageElement?.getAttribute('alt')).toBe('Flame Warrior');
		});

		it('has proper CCG card structure', () => {
			const { container } = render(Card, { 
				props: { 
					cardType: 'ccg',
					name: 'Test Card',
					attack: 1,
					health: 1,
					description: 'Test description',
					imageUrl: 'https://example.com/test.png'
				} 
			});
			
			const ccgHeader = container.querySelector('.ccg-header');
			const ccgImage = container.querySelector('.ccg-image');
			const ccgDescription = container.querySelector('.ccg-description');
			const ccgStats = container.querySelector('.ccg-stats');
			
			expect(ccgHeader).toBeTruthy();
			expect(ccgImage).toBeTruthy();
			expect(ccgDescription).toBeTruthy();
			expect(ccgStats).toBeTruthy();
		});

		it('does not render classic card elements for CCG cards', () => {
			const { container } = render(Card, { 
				props: { 
					cardType: 'ccg',
					name: 'Test Card'
				} 
			});
			
			const topLeft = container.querySelector('.top-left');
			const center = container.querySelector('.card-center');
			const bottomRight = container.querySelector('.bottom-right');
			
			expect(topLeft).toBeFalsy();
			expect(center).toBeFalsy();
			expect(bottomRight).toBeFalsy();
		});
	});

	describe('Classic card type', () => {
		it('renders classic card elements by default', () => {
			const { container } = render(Card);
			
			const cardFront = container.querySelector('.card-front');
			expect(cardFront?.classList.contains('ccg')).toBe(false);
			
			const topLeft = container.querySelector('.top-left');
			const center = container.querySelector('.card-center');
			const bottomRight = container.querySelector('.bottom-right');
			
			expect(topLeft).toBeTruthy();
			expect(center).toBeTruthy();
			expect(bottomRight).toBeTruthy();
		});

		it('does not render CCG elements for classic cards', () => {
			const { container } = render(Card, { 
				props: { cardType: 'classic' }
			});
			
			const ccgHeader = container.querySelector('.ccg-header');
			const ccgImage = container.querySelector('.ccg-image');
			const ccgDescription = container.querySelector('.ccg-description');
			
			expect(ccgHeader).toBeFalsy();
			expect(ccgImage).toBeFalsy();
			expect(ccgDescription).toBeFalsy();
		});
	});
});