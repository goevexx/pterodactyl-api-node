/**
 * Unit tests for EventBatcher
 */

import { EventBatcher } from '../../../../shared/websocket/EventBatcher';
import { WebSocketEvent } from '../../../../shared/websocket/WebSocketTypes';
import { createConsoleEvent, createStatusEvent } from '../../../fixtures';

describe('EventBatcher', () => {
	let batcher: EventBatcher;
	let emittedBatches: WebSocketEvent[][];
	let emitFn: (events: WebSocketEvent[]) => void;

	beforeEach(() => {
		emittedBatches = [];
		emitFn = jest.fn((events: WebSocketEvent[]) => {
			emittedBatches.push(events);
		});
	});

	afterEach(() => {
		if (batcher) {
			batcher.clear();
		}
		jest.clearAllTimers();
	});

	describe('Basic batching', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			batcher = new EventBatcher({
				interval: 100,
				maxBurst: 3,
				discardExcess: false,
			});
		});

		test('should batch events and emit after interval', () => {
			const event1 = createConsoleEvent('Message 1');
			const event2 = createConsoleEvent('Message 2');
			const event3 = createConsoleEvent('Message 3');

			batcher.add(event1, emitFn);
			batcher.add(event2, emitFn);
			batcher.add(event3, emitFn);

			// Events are buffered, not emitted yet (first emission at interval)
			expect(emittedBatches).toHaveLength(0);

			// Advance time by interval
			jest.advanceTimersByTime(100);

			// Should emit all 3 events as a single batch
			expect(emittedBatches).toHaveLength(1);
			expect(emittedBatches[0]).toHaveLength(3);
			expect(emittedBatches[0]).toEqual([event1, event2, event3]);
		});

		test('should split large bursts into multiple batches', () => {
			const events: WebSocketEvent[] = [];
			for (let i = 0; i < 7; i++) {
				events.push(createConsoleEvent(`Message ${i + 1}`));
			}

			events.forEach((event) => batcher.add(event, emitFn));

			// Advance time to trigger first batch
			jest.advanceTimersByTime(100);

			// First 6 events added - should emit first 3 in batch 1, next 3 in batch 2
			// (timer triggers, emits 3, schedules next which fires immediately since buffer has more)
			expect(emittedBatches.length).toBeGreaterThanOrEqual(1);
			expect(emittedBatches[0]).toHaveLength(3);
			expect(emittedBatches[0]).toEqual(events.slice(0, 3));

			// Let remaining batches emit
			jest.runAllTimers();

			// Should have emitted all 7 events in batches of 3, 3, 1
			const allEmitted = emittedBatches.flat();
			expect(allEmitted).toHaveLength(7);
			expect(allEmitted).toEqual(events);
		});

		test('should continue batching after interval', () => {
			const event1 = createConsoleEvent('Message 1');

			batcher.add(event1, emitFn);

			// First event queued
			expect(emittedBatches).toHaveLength(0);

			// Advance past interval
			jest.advanceTimersByTime(100);

			// First batch emitted
			expect(emittedBatches).toHaveLength(1);
			expect(emittedBatches[0]).toEqual([event1]);

			// Add another event after interval has passed
			const event2 = createConsoleEvent('Message 2');
			batcher.add(event2, emitFn);

			// Should be buffered, not emitted immediately
			expect(emittedBatches).toHaveLength(1);

			// Advance time again
			jest.advanceTimersByTime(100);

			// Second batch should be emitted
			expect(emittedBatches).toHaveLength(2);
			expect(emittedBatches[1]).toEqual([event2]);
		});
	});

	describe('Discard excess mode', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			batcher = new EventBatcher({
				interval: 100,
				maxBurst: 2,
				discardExcess: true,
			});
		});

		test('should discard events exceeding buffer limit', () => {
			const events = [
				createConsoleEvent('Message 1'),
				createConsoleEvent('Message 2'),
				createConsoleEvent('Message 3'), // Should be discarded
				createConsoleEvent('Message 4'), // Should be discarded
			];

			events.forEach((event) => batcher.add(event, emitFn));

			// Advance time to emit batch
			jest.advanceTimersByTime(100);

			// Only first 2 events should be in the batch
			expect(emittedBatches).toHaveLength(1);
			expect(emittedBatches[0]).toHaveLength(2);
			expect(emittedBatches[0]).toEqual([events[0], events[1]]);

			// Advance more time - no more batches
			jest.advanceTimersByTime(200);
			expect(emittedBatches).toHaveLength(1);
		});

		test('should accept new events after batch emission', () => {
			const event1 = createConsoleEvent('Message 1');
			const event2 = createConsoleEvent('Message 2');
			const event3 = createConsoleEvent('Message 3'); // Discarded

			batcher.add(event1, emitFn);
			batcher.add(event2, emitFn);
			batcher.add(event3, emitFn);

			// Advance time to emit first batch
			jest.advanceTimersByTime(100);
			expect(emittedBatches).toHaveLength(1);

			// Now buffer is clear, can add more events
			const event4 = createConsoleEvent('Message 4');
			batcher.add(event4, emitFn);

			jest.advanceTimersByTime(100);
			expect(emittedBatches).toHaveLength(2);
			expect(emittedBatches[1]).toEqual([event4]);
		});
	});

	describe('Different event types', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			batcher = new EventBatcher({
				interval: 100,
				maxBurst: 5,
				discardExcess: false,
			});
		});

		test('should handle mixed event types in same batch', () => {
			const consoleEvent = createConsoleEvent('Console message');
			const statusEvent = createStatusEvent('running');

			batcher.add(consoleEvent, emitFn);
			batcher.add(statusEvent, emitFn);

			jest.advanceTimersByTime(100);

			expect(emittedBatches).toHaveLength(1);
			expect(emittedBatches[0]).toHaveLength(2);
			expect(emittedBatches[0]).toEqual([consoleEvent, statusEvent]);
		});
	});

	describe('Clear functionality', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			batcher = new EventBatcher({
				interval: 100,
				maxBurst: 10,
				discardExcess: false,
			});
		});

		test('should clear buffered events', () => {
			batcher.add(createConsoleEvent('1'), emitFn);
			batcher.add(createConsoleEvent('2'), emitFn);
			batcher.add(createConsoleEvent('3'), emitFn);

			expect(emittedBatches).toHaveLength(0);

			batcher.clear();

			// Advance time - buffered events should not be emitted
			jest.advanceTimersByTime(100);

			expect(emittedBatches).toHaveLength(0);
		});

		test('should clear timer on clear()', () => {
			batcher.add(createConsoleEvent('1'), emitFn);
			batcher.add(createConsoleEvent('2'), emitFn);

			batcher.clear();

			// Timer should be cleared
			expect(jest.getTimerCount()).toBe(0);
		});
	});

	describe('Queue length tracking', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			batcher = new EventBatcher({
				interval: 100,
				maxBurst: 3,
				discardExcess: false,
			});
		});

		test('should track buffer length correctly', () => {
			expect(batcher.getQueueLength()).toBe(0);

			batcher.add(createConsoleEvent('1'), emitFn);
			batcher.add(createConsoleEvent('2'), emitFn);

			expect(batcher.getQueueLength()).toBe(2);

			jest.advanceTimersByTime(100);

			// Buffer should be empty after emission
			expect(batcher.getQueueLength()).toBe(0);
		});
	});

	describe('EmitFn validation', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			batcher = new EventBatcher({
				interval: 100,
				maxBurst: 3,
				discardExcess: false,
			});
		});

		test('should warn when different emit function is provided', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			const firstEmitFn = jest.fn();
			const secondEmitFn = jest.fn();

			batcher.add(createConsoleEvent('1'), firstEmitFn);
			expect(consoleSpy).not.toHaveBeenCalled();

			batcher.add(createConsoleEvent('2'), secondEmitFn);
			expect(consoleSpy).toHaveBeenCalledWith(
				'[EventBatcher] Different emit function provided - using first registered function',
			);

			consoleSpy.mockRestore();
		});
	});

	describe('Real-time behavior', () => {
		test('should work with real timers', async () => {
			// Use real timers for this test
			jest.useRealTimers();

			batcher = new EventBatcher({
				interval: 50, // 50ms
				maxBurst: 5,
				discardExcess: false,
			});

			batcher.add(createConsoleEvent('1'), emitFn);
			batcher.add(createConsoleEvent('2'), emitFn);
			batcher.add(createConsoleEvent('3'), emitFn);

			expect(emittedBatches).toHaveLength(0);

			// Wait for interval
			await new Promise((resolve) => setTimeout(resolve, 60));

			expect(emittedBatches).toHaveLength(1);
			expect(emittedBatches[0]).toHaveLength(3);
		}, 1000);
	});
});
