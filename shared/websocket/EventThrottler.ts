import { ThrottleOptions, WebSocketEvent } from './WebSocketTypes';

/**
 * Event throttler to prevent overwhelming n8n workflows with high-frequency events
 */
export class EventThrottler {
	private queue: WebSocketEvent[] = [];
	private lastEmit: number = 0;
	private burstCount: number = 0;
	private interval: number;
	private maxBurst: number;
	private discardExcess: boolean;
	private emitTimer: NodeJS.Timeout | null = null;

	constructor(options: ThrottleOptions) {
		this.interval = options.interval;
		this.maxBurst = options.maxBurst;
		this.discardExcess = options.discardExcess ?? false;
	}

	/**
	 * Add an event to the throttler
	 * @param event - WebSocket event to throttle
	 * @param emitFn - Function to call when event should be emitted
	 */
	add(event: WebSocketEvent, emitFn: (event: WebSocketEvent) => void): void {
		const now = Date.now();
		const timeSinceLastEmit = now - this.lastEmit;

		// Reset burst counter if interval has passed
		if (this.lastEmit > 0 && timeSinceLastEmit >= this.interval) {
			this.burstCount = 0;
		}

		// Check if we can emit immediately (within burst limit)
		if (this.burstCount < this.maxBurst) {
			this.emit(event, emitFn);
		} else {
			// Queue or discard based on configuration
			if (this.discardExcess) {
				// Discard excess events
				console.log(`[EventThrottler] Discarding event: ${event.event}`);
			} else {
				// Add to queue
				this.queue.push(event);
				this.scheduleNextEmit(emitFn);
			}
		}
	}

	/**
	 * Emit an event
	 */
	private emit(event: WebSocketEvent, emitFn: (event: WebSocketEvent) => void): void {
		this.lastEmit = Date.now();
		this.burstCount++;
		emitFn(event);
	}

	/**
	 * Schedule the next event emission from the queue
	 */
	private scheduleNextEmit(emitFn: (event: WebSocketEvent) => void): void {
		// Clear existing timer
		if (this.emitTimer) {
			return; // Timer already scheduled
		}

		const now = Date.now();
		const timeSinceLastEmit = now - this.lastEmit;
		const delay = Math.max(0, this.interval - timeSinceLastEmit);

		this.emitTimer = setTimeout(() => {
			this.emitTimer = null;

			// Reset burst count if interval has passed
			const now = Date.now();
			const timeSinceLastEmit = now - this.lastEmit;
			if (this.lastEmit > 0 && timeSinceLastEmit >= this.interval) {
				this.burstCount = 0;
			}

			// Emit next event from queue
			if (this.queue.length > 0) {
				const event = this.queue.shift();
				if (event) {
					this.emit(event, emitFn);

					// Schedule next if queue still has events
					if (this.queue.length > 0) {
						this.scheduleNextEmit(emitFn);
					}
				}
			}
		}, delay);
	}

	/**
	 * Clear all queued events and timers
	 */
	clear(): void {
		this.queue = [];
		if (this.emitTimer) {
			clearTimeout(this.emitTimer);
			this.emitTimer = null;
		}
		this.burstCount = 0;
	}

	/**
	 * Get current queue length
	 */
	getQueueLength(): number {
		return this.queue.length;
	}
}
