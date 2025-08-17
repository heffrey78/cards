import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('Main Game Page', () => {
	it('renders the game interface', () => {
		render(Page);
		
		expect(screen.getByText('Card Game Engine')).toBeInTheDocument();
		expect(screen.getByText(/Click and drag the card/)).toBeInTheDocument();
	});

	it('displays playing field and card', () => {
		const { container } = render(Page);
		
		const playingField = container.querySelector('.playing-field');
		const card = container.querySelector('.card');
		
		expect(playingField).toBeInTheDocument();
		expect(card).toBeInTheDocument();
	});

	it('positions card at initial coordinates', () => {
		const { container } = render(Page);
		const card = container.querySelector('.card');
		
		expect(card?.getAttribute('style')).toContain('left: 100px');
		expect(card?.getAttribute('style')).toContain('top: 100px');
	});

	it('card is draggable', () => {
		const { container } = render(Page);
		const card = container.querySelector('.card');
		
		expect(card?.getAttribute('role')).toBe('button');
		expect(card?.getAttribute('tabindex')).toBe('0');
	});

	it('constrains card position within playing field boundaries', async () => {
		const { container } = render(Page);
		const card = container.querySelector('.card') as HTMLElement;
		
		// Mock getBoundingClientRect
		card.getBoundingClientRect = vi.fn(() => ({
			left: 100,
			top: 100,
			width: 80,
			height: 120,
			right: 180,
			bottom: 220,
			x: 100,
			y: 100,
			toJSON: vi.fn()
		}));

		// Try to drag beyond right boundary
		await fireEvent.mouseDown(card, { clientX: 140, clientY: 160 });
		await fireEvent.mouseMove(document, { clientX: 900, clientY: 160 }); // Beyond field width
		await fireEvent.mouseUp(document);
		
		// Card should be constrained to field boundary (800 - 80 = 720px max)
		const style = card.getAttribute('style');
		expect(style).toContain('left: 720px');
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