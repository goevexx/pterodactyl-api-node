import { BatchOptions, WebSocketEvent } from './WebSocketTypes';

/**
 * Event batcher to batch high-frequency events and reduce workflow executions
 */
export class EventBatcher {
	private buffer: WebSocketEvent[] = [];
	private lastEmit: number = 0;
	private interval: number;
	private maxBurst: number;
	private discardExcess: boolean;
	private emitTimer: NodeJS.Timeout | null = null;
	private emitFn: ((events: WebSocketEvent[]) => void) | null = null;

	constructor(options: BatchOptions) {
		this.interval = options.interval;
		this.maxBurst = options.maxBurst;
		this.discardExcess = options.discardExcess ?? false;
	}

	/**
	 * Add an event to the batcher
	 * @param event - WebSocket event to batch
	 * @param emitFn - Function to call when events should be emitted (receives array of events)
	 */
	add(event: WebSocketEvent, emitFn: (events: WebSocketEvent[]) => void): void {
		// Store emit function (should be consistent across calls)
		if (!this.emitFn) {
			this.emitFn = emitFn;
		} else if (this.emitFn !== emitFn) {
			console.warn('[EventBatcher] Different emit function provided - using first registered function');
		}

		// Add event to buffer
		if (this.discardExcess && this.buffer.length >= this.maxBurst) {
			// Buffer is full - discard excess events
			console.log(`[EventBatcher] Discarding event: ${event.event} (buffer full at ${this.buffer.length}/${this.maxBurst})`);
			return;
		}

		this.buffer.push(event);

		// Schedule emission if not already scheduled
		this.scheduleNextEmit();
	}

	/**
	 * Emit accumulated events as a batch
	 */
	private emitBatch(): void {
		if (this.buffer.length === 0 || !this.emitFn) {
			return;
		}

		// Take up to maxBurst events from buffer
		const eventsToEmit = this.buffer.splice(0, this.maxBurst);
		
		this.lastEmit = Date.now();
		this.emitFn(eventsToEmit);

		// Clear the timer since we just emitted
		if (this.emitTimer) {
			clearTimeout(this.emitTimer);
			this.emitTimer = null;
		}

		// If there are still events in buffer, schedule next emission
		if (this.buffer.length > 0) {
			this.scheduleNextEmit();
		}
	}

	/**
	 * Schedule the next batch emission
	 */
	private scheduleNextEmit(): void {
		// Don't schedule if timer already exists
		if (this.emitTimer) {
			return;
		}

		const now = Date.now();
		const timeSinceLastEmit = now - this.lastEmit;
		const delay = Math.max(0, this.interval - timeSinceLastEmit);

		this.emitTimer = setTimeout(() => {
			this.emitTimer = null;
			this.emitBatch();
		}, delay);
	}

	/**
	 * Clear all buffered events and timers
	 */
	clear(): void {
		this.buffer = [];
		if (this.emitTimer) {
			clearTimeout(this.emitTimer);
			this.emitTimer = null;
		}
		this.emitFn = null;
	}

	/**
	 * Get current buffer length
	 */
	getQueueLength(): number {
		return this.buffer.length;
	}
}
