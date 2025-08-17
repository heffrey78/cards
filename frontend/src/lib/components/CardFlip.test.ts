import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Card from './Card.svelte';

describe('Card Flip Functionality', () => {
	it('renders both card faces', () => {
		const { container } = render(Card);
		
		const cardFront = container.querySelector('.card-front');
		const cardBack = container.querySelector('.card-back');
		const cardInner = container.querySelector('.card-inner');
		
		expect(cardFront).toBeTruthy();
		expect(cardBack).toBeTruthy();
		expect(cardInner).toBeTruthy();
	});

	it('shows front face by default', () => {
		const { container } = render(Card);
		const cardInner = container.querySelector('.card-inner');
		
		expect(cardInner?.classList.contains('flipped')).toBe(false);
	});

	it('shows back face when flipped prop is true', () => {
		const { container } = render(Card, { 
			props: { flipped: true } 
		});
		const cardInner = container.querySelector('.card-inner');
		
		expect(cardInner?.classList.contains('flipped')).toBe(true);
	});

	it('calls onFlipChange when double-clicked', async () => {
		const onFlipChange = vi.fn();
		const { container } = render(Card, { 
			props: { onFlipChange } 
		});
		const card = container.querySelector('.card-container') as HTMLElement;
		
		// First click
		await fireEvent.mouseDown(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(card, { clientX: 40, clientY: 60 });
		
		// Second click quickly (double click)
		await fireEvent.mouseDown(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(card, { clientX: 40, clientY: 60 });
		
		expect(onFlipChange).toHaveBeenCalledWith(true);
	});

	it('toggles flip state on double click', async () => {
		const onFlipChange = vi.fn();
		const { container } = render(Card, { 
			props: { flipped: false, onFlipChange } 
		});
		const card = container.querySelector('.card-container') as HTMLElement;
		
		// First click
		await fireEvent.mouseDown(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(card, { clientX: 40, clientY: 60 });
		
		// Second click quickly (double click)
		await fireEvent.mouseDown(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(card, { clientX: 40, clientY: 60 });
		
		expect(onFlipChange).toHaveBeenLastCalledWith(true);
	});

	it('prevents flip during animation', async () => {
		const onFlipChange = vi.fn();
		const { container } = render(Card, { 
			props: { onFlipChange } 
		});
		const card = container.querySelector('.card-container') as HTMLElement;
		
		// First double click
		await fireEvent.mouseDown(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseDown(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(card, { clientX: 40, clientY: 60 });
		
		// Immediate second double click should be ignored during animation
		await fireEvent.mouseDown(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseDown(card, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(card, { clientX: 40, clientY: 60 });
		
		// Should only be called once
		expect(onFlipChange).toHaveBeenCalledTimes(1);
	});

	it('has proper card back design structure', () => {
		const { container } = render(Card);
		
		const cardBack = container.querySelector('.card-back');
		const pattern = cardBack?.querySelector('.card-back-pattern');
		const border = pattern?.querySelector('.pattern-border');
		const center = pattern?.querySelector('.pattern-center');
		const diamonds = center?.querySelectorAll('.diamond');
		
		expect(cardBack).toBeTruthy();
		expect(pattern).toBeTruthy();
		expect(border).toBeTruthy();
		expect(center).toBeTruthy();
		expect(diamonds).toHaveLength(4);
	});

	it('applies flipping class during animation', async () => {
		const { container } = render(Card);
		const cardContainer = container.querySelector('.card-container') as HTMLElement;
		
		expect(cardContainer?.classList.contains('flipping')).toBe(false);
		
		// Double click to trigger flip
		await fireEvent.mouseDown(cardContainer, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(cardContainer, { clientX: 40, clientY: 60 });
		await fireEvent.mouseDown(cardContainer, { clientX: 40, clientY: 60 });
		await fireEvent.mouseUp(cardContainer, { clientX: 40, clientY: 60 });
		
		// Should have flipping class during animation
		expect(cardContainer?.classList.contains('flipping')).toBe(true);
	});

	it('maintains flip state during drag operations', () => {
		const { container } = render(Card, { 
			props: { flipped: true, draggable: true } 
		});
		const cardInner = container.querySelector('.card-inner');
		
		// Should maintain flipped state even when draggable
		expect(cardInner?.classList.contains('flipped')).toBe(true);
	});
});