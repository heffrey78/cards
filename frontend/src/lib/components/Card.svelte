<script lang="ts">
	interface CardProps {
		suit?: string;
		rank?: string;
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		class?: string;
		draggable?: boolean;
		onPositionChange?: (x: number, y: number) => void;
	}

	let { 
		suit = '♠', 
		rank = 'A', 
		x = 0, 
		y = 0, 
		width = 80, 
		height = 120, 
		class: className = '',
		draggable = true,
		onPositionChange,
		...props 
	}: CardProps = $props();

	const isRed = $derived(suit === '♥' || suit === '♦');

	let isDragging = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	let cardElement: HTMLElement;

	function handleMouseDown(event: MouseEvent) {
		if (!draggable) return;
		
		event.preventDefault();
		isDragging = true;
		
		// Calculate offset relative to the card's current position in the playing field
		const parentRect = cardElement.parentElement?.getBoundingClientRect();
		const parentX = parentRect?.left || 0;
		const parentY = parentRect?.top || 0;
		
		dragOffset = {
			x: event.clientX - parentX - x,
			y: event.clientY - parentY - y
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;

		const parentRect = cardElement.parentElement?.getBoundingClientRect();
		const parentX = parentRect?.left || 0;
		const parentY = parentRect?.top || 0;

		const newX = event.clientX - parentX - dragOffset.x;
		const newY = event.clientY - parentY - dragOffset.y;

		// Update position immediately for smooth dragging
		x = newX;
		y = newY;
	}

	function handleMouseUp(event: MouseEvent) {
		if (!isDragging) return;

		isDragging = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		// Notify parent of position change
		if (onPositionChange) {
			onPositionChange(x, y);
		}
	}
</script>

<div 
	bind:this={cardElement}
	class="card {className}" 
	class:red={isRed}
	class:dragging={isDragging}
	style="
		left: {x}px; 
		top: {y}px; 
		width: {width}px; 
		height: {height}px;
	"
	onmousedown={handleMouseDown}
	role="button"
	tabindex="0"
	{...props}
>
	<div class="card-corner top-left">
		<div class="rank">{rank}</div>
		<div class="suit">{suit}</div>
	</div>
	
	<div class="card-center">
		<div class="suit-large">{suit}</div>
	</div>
	
	<div class="card-corner bottom-right">
		<div class="rank">{rank}</div>
		<div class="suit">{suit}</div>
	</div>
</div>

<style>
	.card {
		position: absolute;
		background: white;
		border: 2px solid #333;
		border-radius: 8px;
		box-shadow: 
			0 2px 4px rgba(0,0,0,0.2),
			0 1px 2px rgba(0,0,0,0.1);
		cursor: pointer;
		user-select: none;
		transition: transform 0.1s ease;
		display: flex;
		flex-direction: column;
		font-family: serif;
		color: #000;
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: 
			0 4px 8px rgba(0,0,0,0.3),
			0 2px 4px rgba(0,0,0,0.2);
	}

	.card.dragging {
		transform: scale(1.05);
		box-shadow: 
			0 8px 16px rgba(0,0,0,0.4),
			0 4px 8px rgba(0,0,0,0.3);
		z-index: 1000;
		transition: none;
	}

	.card.red {
		color: #d32f2f;
	}

	.card-corner {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 12px;
		font-weight: bold;
		line-height: 1;
	}

	.top-left {
		top: 4px;
		left: 4px;
	}

	.bottom-right {
		bottom: 4px;
		right: 4px;
		transform: rotate(180deg);
	}

	.card-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.suit-large {
		font-size: 32px;
		opacity: 0.3;
	}

	.rank {
		font-size: 12px;
		margin-bottom: 1px;
	}

	.suit {
		font-size: 10px;
	}
</style>