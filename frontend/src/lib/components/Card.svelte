<script lang="ts">
	interface CardProps {
		// Classic card properties
		suit?: string;
		rank?: string;
		
		// CCG card properties
		cardType?: 'classic' | 'ccg';
		name?: string;
		attack?: number;
		health?: number;
		description?: string;
		imageUrl?: string;
		
		// Common properties
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		class?: string;
		draggable?: boolean;
		flipped?: boolean;
		zIndex?: number;
		onPositionChange?: (x: number, y: number) => void;
		onFlipChange?: (flipped: boolean) => void;
		onDragStart?: () => void;
		onDragEnd?: () => void;
	}

	let { 
		// Classic card props
		suit = '♠', 
		rank = 'A', 
		
		// CCG card props
		cardType = 'classic',
		name = '',
		attack = 0,
		health = 0,
		description = '',
		imageUrl = '',
		
		// Common props
		x = 0, 
		y = 0, 
		width = 80, 
		height = 120, 
		class: className = '',
		draggable = true,
		flipped = false,
		zIndex = 1,
		onPositionChange,
		onFlipChange,
		onDragStart,
		onDragEnd,
		...props 
	}: CardProps = $props();

	const isRed = $derived(suit === '♥' || suit === '♦');

	let isDragging = $state(false);
	let isFlipping = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	let cardElement: HTMLElement;
	let clickCount = 0;
	let clickTimer: ReturnType<typeof setTimeout>;

	function handleMouseDown(event: MouseEvent) {
		if (!draggable || isFlipping) return;
		
		event.preventDefault();
		
		// Start tracking for potential drag
		const startTime = Date.now();
		const startX = event.clientX;
		const startY = event.clientY;
		
		function onMouseMove(moveEvent: MouseEvent) {
			const deltaX = Math.abs(moveEvent.clientX - startX);
			const deltaY = Math.abs(moveEvent.clientY - startY);
			
			// If mouse moved more than 5px, start dragging
			if (deltaX > 5 || deltaY > 5) {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
				startDrag(event);
			}
		}
		
		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			
			// If mouse up quickly without movement, it's a click
			const duration = Date.now() - startTime;
			if (duration < 200) {
				handleClick();
			}
		}
		
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	function handleClick() {
		clickCount++;
		
		if (clickCount === 1) {
			clickTimer = setTimeout(() => {
				// Single click - do nothing (drag is handled separately)
				clickCount = 0;
			}, 250);
		} else if (clickCount === 2) {
			// Double click - flip card
			clearTimeout(clickTimer);
			handleDoubleClick();
			clickCount = 0;
		}
	}

	function handleDoubleClick() {
		if (isFlipping) return;
		
		isFlipping = true;
		const newFlippedState = !flipped;
		
		// Notify parent of flip change
		if (onFlipChange) {
			onFlipChange(newFlippedState);
		}
		
		// Reset flip animation state after animation completes
		setTimeout(() => {
			isFlipping = false;
		}, 300);
	}

	function startDrag(event: MouseEvent) {
		if (!draggable || isFlipping) return;
		
		isDragging = true;
		
		// Notify parent that drag started
		if (onDragStart) {
			onDragStart();
		}
		
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

		// Notify parent that drag ended
		if (onDragEnd) {
			onDragEnd();
		}
	}
</script>

<div 
	bind:this={cardElement}
	class="card-container" 
	class:flipping={isFlipping}
	class:dragging={isDragging}
	style="
		left: {x}px; 
		top: {y}px; 
		width: {width}px; 
		height: {height}px;
		z-index: {zIndex};
	"
	onmousedown={handleMouseDown}
	role="button"
	tabindex="0"
	{...props}
>
	<div class="card-inner" class:flipped>
		<!-- Card Front -->
		<div class="card-face card-front {className}" class:red={isRed} class:ccg={cardType === 'ccg'}>
			{#if cardType === 'classic'}
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
			{:else if cardType === 'ccg'}
				<!-- CCG Card Layout -->
				<div class="ccg-header">
					<div class="ccg-name">{name}</div>
					<div class="ccg-stats">
						<span class="attack">{attack}</span>
						<span class="health">{health}</span>
					</div>
				</div>
				
				<div class="ccg-image">
					<img src={imageUrl} alt={name} />
				</div>
				
				<div class="ccg-description">
					{description}
				</div>
			{/if}
		</div>

		<!-- Card Back -->
		<div class="card-face card-back">
			<div class="card-back-pattern">
				<div class="pattern-border"></div>
				<div class="pattern-center">
					<div class="diamond-pattern">
						<div class="diamond"></div>
						<div class="diamond"></div>
						<div class="diamond"></div>
						<div class="diamond"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.card-container {
		position: absolute;
		cursor: pointer;
		user-select: none;
		perspective: 1000px;
	}

	.card-container:hover .card-inner {
		transform: translateY(-2px) rotateY(var(--rotation, 0deg));
	}

	.card-container.dragging .card-inner {
		transform: scale(1.05) rotateY(var(--rotation, 0deg));
		z-index: 1000;
		transition: none;
	}

	.card-container.flipping .card-inner {
		transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
	}

	.card-inner {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 0.1s ease;
	}

	.card-inner.flipped {
		--rotation: 180deg;
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		border: 2px solid #333;
		border-radius: 8px;
		box-shadow: 
			0 2px 4px rgba(0,0,0,0.2),
			0 1px 2px rgba(0,0,0,0.1);
		display: flex;
		flex-direction: column;
		font-family: serif;
	}

	.card-front {
		background: white;
		color: #000;
	}

	.card-front.red {
		color: #d32f2f;
	}

	.card-back {
		background: linear-gradient(135deg, #1a237e, #3949ab);
		transform: rotateY(180deg);
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

	/* Card Back Design */
	.card-back-pattern {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	.pattern-border {
		position: absolute;
		top: 8px;
		left: 8px;
		right: 8px;
		bottom: 8px;
		border: 2px solid #fff;
		border-radius: 4px;
		opacity: 0.8;
	}

	.pattern-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 1;
	}

	.diamond-pattern {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 8px;
		width: 40px;
		height: 40px;
	}

	.diamond {
		width: 16px;
		height: 16px;
		background: #fff;
		transform: rotate(45deg);
		opacity: 0.9;
	}

	.diamond:nth-child(1) { opacity: 0.9; }
	.diamond:nth-child(2) { opacity: 0.7; }
	.diamond:nth-child(3) { opacity: 0.7; }
	.diamond:nth-child(4) { opacity: 0.9; }

	/* CCG Card Styles */
	.card-front.ccg {
		display: flex;
		flex-direction: column;
		padding: 6px;
		background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
		border: 2px solid #444;
	}

	.ccg-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.ccg-name {
		font-size: 10px;
		font-weight: bold;
		color: #333;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		flex: 1;
	}

	.ccg-stats {
		display: flex;
		gap: 4px;
		font-size: 10px;
		font-weight: bold;
	}

	.attack {
		background: #ff6b6b;
		color: white;
		padding: 2px 4px;
		border-radius: 3px;
		min-width: 16px;
		text-align: center;
	}

	.health {
		background: #4ecdc4;
		color: white;
		padding: 2px 4px;
		border-radius: 3px;
		min-width: 16px;
		text-align: center;
	}

	.ccg-image {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 4px 0;
		min-height: 60px;
		background: #ddd;
		border-radius: 4px;
		overflow: hidden;
	}

	.ccg-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.ccg-description {
		font-size: 8px;
		color: #555;
		text-align: center;
		line-height: 1.2;
		background: rgba(255, 255, 255, 0.8);
		padding: 3px;
		border-radius: 3px;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}
</style>