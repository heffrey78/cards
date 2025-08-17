import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import PlayingField from './PlayingField.svelte';

describe('PlayingField', () => {
	it('renders with default dimensions', () => {
		const { container } = render(PlayingField);
		const field = container.querySelector('.playing-field');
		
		expect(field).toBeTruthy();
		expect(field?.getAttribute('style')).toContain('width: 800px');
		expect(field?.getAttribute('style')).toContain('height: 600px');
	});

	it('renders with custom dimensions', () => {
		const { container } = render(PlayingField, { 
			props: { width: 1000, height: 750 } 
		});
		const field = container.querySelector('.playing-field');
		
		expect(field?.getAttribute('style')).toContain('width: 1000px');
		expect(field?.getAttribute('style')).toContain('height: 750px');
	});

	it('applies custom CSS class', () => {
		const { container } = render(PlayingField, { 
			props: { class: 'custom-field' } 
		});
		const field = container.querySelector('.playing-field');
		
		expect(field?.classList.contains('custom-field')).toBe(true);
	});

	it('has proper styling classes', () => {
		const { container } = render(PlayingField);
		const field = container.querySelector('.playing-field');
		
		expect(field?.classList.contains('playing-field')).toBe(true);
	});
});