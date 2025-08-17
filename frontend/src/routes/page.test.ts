import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('Main Game Page', () => {
	it('renders the game interface', () => {
		render(Page);
		
		expect(screen.getByText('Card Game Engine')).toBeInTheDocument();
		expect(screen.getByText(/Click and drag the card/)).toBeInTheDocument();
		expect(screen.getByText(/Double-click the card to flip/)).toBeInTheDocument();
	});

	it('displays playing field and card', () => {
		const { container } = render(Page);
		
		const playingField = container.querySelector('.playing-field');
		const card = container.querySelector('.card-container');
		
		expect(playingField).toBeInTheDocument();
		expect(card).toBeInTheDocument();
	});

	it('positions card at initial coordinates', () => {
		const { container } = render(Page);
		const card = container.querySelector('.card-container');
		
		expect(card?.getAttribute('style')).toContain('left: 100px');
		expect(card?.getAttribute('style')).toContain('top: 100px');
	});

	it('card is draggable', () => {
		const { container } = render(Page);
		const card = container.querySelector('.card-container');
		
		expect(card?.getAttribute('role')).toBe('button');
		expect(card?.getAttribute('tabindex')).toBe('0');
	});

	it('has flip functionality available', async () => {
		const { container } = render(Page);
		const cardInner = container.querySelector('.card-inner');
		const cardFront = container.querySelector('.card-front');
		const cardBack = container.querySelector('.card-back');
		
		// Should have both card faces and start unflipped
		expect(cardFront).toBeInTheDocument();
		expect(cardBack).toBeInTheDocument();
		expect(cardInner?.classList.contains('flipped')).toBe(false);
	});

	it('displays Ace of Spades by default', () => {
		const { container } = render(Page);
		const ranks = container.querySelectorAll('.rank');
		const suits = container.querySelectorAll('.suit');
		
		expect(ranks[0]?.textContent).toBe('A');
		expect(suits[0]?.textContent).toBe('♠');
	});

	it('has proper page metadata', () => {
		render(Page);
		
		// Note: These would typically be tested in e2e tests since they affect document head
		// Here we just verify the component structure includes the svelte:head
		expect(document.title).toBe('Card Game Engine');
	});
});