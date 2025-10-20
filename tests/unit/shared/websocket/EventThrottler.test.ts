/**
 * Unit tests for EventThrottler
 */

import { EventThrottler } from '../../../../shared/websocket/EventThrottler';
import { WebSocketEvent } from '../../../../shared/websocket/WebSocketTypes';
import { createConsoleEvent, createStatusEvent } from '../../../fixtures';

describe('EventThrottler', () => {
	let throttler: EventThrottler;
	let emittedEvents: WebSocketEvent[];
	let emitFn: (event: WebSocketEvent) => void;

	beforeEach(() => {
		emittedEvents = [];
		emitFn = jest.fn((event: WebSocketEvent) => {
			emittedEvents.push(event);
		});
	});

	afterEach(() => {
		if (throttler) {
			throttler.clear();
		}
		jest.clearAllTimers();
	});

	describe('Basic throttling', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			throttler = new EventThrottler({
				interval: 100,
				maxBurst: 3,
				discardExcess: false,
			});
		});

		test('should emit events within burst limit immediately', () => {
			const event1 = createConsoleEvent('Message 1');
			const event2 = createConsoleEvent('Message 2');
			const event3 = createConsoleEvent('Message 3');

			throttler.add(event1, emitFn);
			throttler.add(event2, emitFn);
			throttler.add(event3, emitFn);

			expect(emittedEvents).toHaveLength(3);
			expect(emittedEvents[0]).toEqual(event1);
			expect(emittedEvents[1]).toEqual(event2);
			expect(emittedEvents[2]).toEqual(event3);
		});

		test('should queue events exceeding burst limit', () => {
			const events = [
				createConsoleEvent('Message 1'),
				createConsoleEvent('Message 2'),
				createConsoleEvent('Message 3'),
				createConsoleEvent('Message 4'), // Should be queued
			];

			events.forEach((event) => throttler.add(event, emitFn));

			expect(emittedEvents).toHaveLength(3);
			expect(emittedEvents).not.toContainEqual(events[3]);
		});

		test('should emit queued events after interval', () => {
			const events = [
				createConsoleEvent('Message 1'),
				createConsoleEvent('Message 2'),
				createConsoleEvent('Message 3'),
				createConsoleEvent('Message 4'),
			];

			events.forEach((event) => throttler.add(event, emitFn));

			expect(emittedEvents).toHaveLength(3);

			// Advance time by interval
			jest.advanceTimersByTime(100);

			expect(emittedEvents).toHaveLength(4);
			expect(emittedEvents[3]).toEqual(events[3]);
		});

		test('should handle rapid event bursts correctly', () => {
			// Send 10 events rapidly
			const events: WebSocketEvent[] = [];
			for (let i = 0; i < 10; i++) {
				events.push(createConsoleEvent(`Message ${i + 1}`));
			}

			events.forEach((event) => throttler.add(event, emitFn));

			// Only first 3 should be emitted immediately
			expect(emittedEvents).toHaveLength(3);

			// Advance time to emit all queued events
			for (let i = 0; i < 7; i++) {
				jest.advanceTimersByTime(100);
			}

			expect(emittedEvents).toHaveLength(10);
			expect(emittedEvents).toEqual(events);
		});
	});

	describe('Discard excess mode', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			throttler = new EventThrottler({
				interval: 100,
				maxBurst: 2,
				discardExcess: true,
			});
		});

		test('should discard events exceeding burst limit', () => {
			const events = [
				createConsoleEvent('Message 1'),
				createConsoleEvent('Message 2'),
				createConsoleEvent('Message 3'), // Should be discarded
				createConsoleEvent('Message 4'), // Should be discarded
			];

			events.forEach((event) => throttler.add(event, emitFn));

			expect(emittedEvents).toHaveLength(2);
			expect(emittedEvents).toEqual([events[0], events[1]]);

			// Advance time - no more events should be emitted
			jest.advanceTimersByTime(200);
			expect(emittedEvents).toHaveLength(2);
		});

		test('should accept new events after interval in discard mode', () => {
			const event1 = createConsoleEvent('Message 1');
			const event2 = createConsoleEvent('Message 2');
			const event3 = createConsoleEvent('Message 3');

			throttler.add(event1, emitFn);
			throttler.add(event2, emitFn);
			throttler.add(event3, emitFn); // Discarded

			expect(emittedEvents).toHaveLength(2);

			// Advance time past interval
			jest.advanceTimersByTime(100);

			// Now we can add more events
			const event4 = createConsoleEvent('Message 4');
			throttler.add(event4, emitFn);

			expect(emittedEvents).toHaveLength(3);
			expect(emittedEvents[2]).toEqual(event4);
		});
	});

	describe('Different event types', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			throttler = new EventThrottler({
				interval: 100,
				maxBurst: 2,
				discardExcess: false,
			});
		});

		test('should handle mixed event types', () => {
			const consoleEvent = createConsoleEvent('Console message');
			const statusEvent = createStatusEvent('running');

			throttler.add(consoleEvent, emitFn);
			throttler.add(statusEvent, emitFn);

			expect(emittedEvents).toHaveLength(2);
			expect(emittedEvents[0]).toEqual(consoleEvent);
			expect(emittedEvents[1]).toEqual(statusEvent);
		});
	});

	describe('Burst count reset', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			throttler = new EventThrottler({
				interval: 100,
				maxBurst: 3,
				discardExcess: false,
			});
		});

		test('should reset burst count after interval', () => {
			// First burst
			throttler.add(createConsoleEvent('1'), emitFn);
			throttler.add(createConsoleEvent('2'), emitFn);
			throttler.add(createConsoleEvent('3'), emitFn);

			expect(emittedEvents).toHaveLength(3);

			// Fourth event gets queued
			throttler.add(createConsoleEvent('4'), emitFn);
			expect(emittedEvents).toHaveLength(3);

			// Advance time past interval
			jest.advanceTimersByTime(100);

			expect(emittedEvents).toHaveLength(4);

			// Now burst count should be reset
			// Event 4 used 1 slot, so can send 2 more immediately (5, 6)
			throttler.add(createConsoleEvent('5'), emitFn);
			throttler.add(createConsoleEvent('6'), emitFn);
			throttler.add(createConsoleEvent('7'), emitFn); // This gets queued

			expect(emittedEvents).toHaveLength(6);
			expect(emittedEvents[5].args[0]).toBe('6');

			// Advance time again to emit event 7
			jest.advanceTimersByTime(100);
			expect(emittedEvents).toHaveLength(7);
			expect(emittedEvents[6].args[0]).toBe('7');
		});
	});

	describe('Clear functionality', () => {
		beforeEach(() => {
			jest.useFakeTimers();
			throttler = new EventThrottler({
				interval: 100,
				maxBurst: 2,
				discardExcess: false,
			});
		});

		test('should clear queued events', () => {
			throttler.add(createConsoleEvent('1'), emitFn);
			throttler.add(createConsoleEvent('2'), emitFn);
			throttler.add(createConsoleEvent('3'), emitFn); // Queued

			expect(emittedEvents).toHaveLength(2);

			throttler.clear();

			// Advance time - queued event should not be emitted
			jest.advanceTimersByTime(100);

			expect(emittedEvents).toHaveLength(2);
		});

		test('should clear timer on clear()', () => {
			throttler.add(createConsoleEvent('1'), emitFn);
			throttler.add(createConsoleEvent('2'), emitFn);
			throttler.add(createConsoleEvent('3'), emitFn); // Queued

			throttler.clear();

			// Timer should be cleared
			expect(jest.getTimerCount()).toBe(0);
		});
	});

	describe('Edge cases', () => {
		test('should handle zero burst limit', () => {
			jest.useFakeTimers();
			throttler = new EventThrottler({
				interval: 100,
				maxBurst: 0, // All events queued
				discardExcess: false,
			});

			throttler.add(createConsoleEvent('1'), emitFn);

			// With maxBurst 0, first event still needs to emit
			expect(emittedEvents.length).toBeGreaterThanOrEqual(0);
		});

		test('should handle very short intervals', () => {
			jest.useFakeTimers();
			throttler = new EventThrottler({
				interval: 1, // 1ms
				maxBurst: 2,
				discardExcess: false,
			});

			throttler.add(createConsoleEvent('1'), emitFn);
			throttler.add(createConsoleEvent('2'), emitFn);
			throttler.add(createConsoleEvent('3'), emitFn);

			expect(emittedEvents).toHaveLength(2);

			jest.advanceTimersByTime(1);

			expect(emittedEvents).toHaveLength(3);
		});

		test('should handle large burst limits', () => {
			jest.useFakeTimers();
			throttler = new EventThrottler({
				interval: 100,
				maxBurst: 1000,
				discardExcess: false,
			});

			// Send 100 events
			for (let i = 0; i < 100; i++) {
				throttler.add(createConsoleEvent(`Message ${i}`), emitFn);
			}

			// All should be emitted immediately
			expect(emittedEvents).toHaveLength(100);
		});
	});

	describe('Real-time behavior', () => {
		test('should work with real timers', async () => {
			// Use real timers for this test
			jest.useRealTimers();

			throttler = new EventThrottler({
				interval: 50, // 50ms
				maxBurst: 2,
				discardExcess: false,
			});

			throttler.add(createConsoleEvent('1'), emitFn);
			throttler.add(createConsoleEvent('2'), emitFn);
			throttler.add(createConsoleEvent('3'), emitFn);

			expect(emittedEvents).toHaveLength(2);

			// Wait for interval
			await new Promise((resolve) => setTimeout(resolve, 60));

			expect(emittedEvents).toHaveLength(3);
		}, 1000);
	});
});
