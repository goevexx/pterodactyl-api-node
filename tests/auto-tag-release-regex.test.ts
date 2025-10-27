/**
 * Tests for auto-tag-release.yml regex pattern validation
 *
 * This test suite validates the regex pattern used in the GitHub Actions workflow
 * to extract version numbers from release PR titles.
 *
 * Pattern: ^chore\(release\):[[:space:]]+v([0-9]+\.[0-9]+\.[0-9]+)$
 *
 * Expected format: "chore(release): vX.Y.Z"
 * where X, Y, Z are numeric version components (semantic versioning)
 */

describe('Auto Tag Release - Regex Pattern Validation', () => {
	/**
	 * Simulates the bash regex matching used in the workflow
	 * Pattern: ^chore\(release\):[[:space:]]+v([0-9]+\.[0-9]+\.[0-9]+)$
	 *
	 * Note: [[:space:]]+ in bash matches one or more whitespace characters
	 * In JavaScript, we use \s+ which is equivalent
	 */
	const releasePattern = /^chore\(release\):\s+v([0-9]+\.[0-9]+\.[0-9]+)$/;

	function extractVersion(prTitle: string): string | null {
		const match = prTitle.match(releasePattern);
		return match ? match[1] : null;
	}

	function isReleaseTitle(prTitle: string): boolean {
		return releasePattern.test(prTitle);
	}

	describe('Valid Release PR Titles', () => {
		it('should match standard release title format', () => {
			const title = 'chore(release): v1.2.3';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('1.2.3');
		});

		it('should match single digit versions', () => {
			const title = 'chore(release): v1.0.0';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('1.0.0');
		});

		it('should match multi-digit versions', () => {
			const title = 'chore(release): v10.20.30';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('10.20.30');
		});

		it('should match large version numbers', () => {
			const title = 'chore(release): v999.888.777';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('999.888.777');
		});

		it('should match version with zero components', () => {
			const title = 'chore(release): v0.0.1';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('0.0.1');
		});

		it('should match with single space after colon', () => {
			const title = 'chore(release): v1.2.3';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('1.2.3');
		});

		it('should match with multiple spaces after colon', () => {
			const title = 'chore(release):   v1.2.3';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('1.2.3');
		});

		it('should match with tab after colon', () => {
			const title = 'chore(release):\tv1.2.3';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('1.2.3');
		});

		it('should match realistic version numbers', () => {
			const versions = ['1.0.0', '1.1.0', '2.0.0', '1.0.1', '3.14.159', '100.0.0'];

			versions.forEach((version) => {
				const title = `chore(release): v${version}`;
				expect(isReleaseTitle(title)).toBe(true);
				expect(extractVersion(title)).toBe(version);
			});
		});
	});

	describe('Invalid Release PR Titles - Missing v Prefix', () => {
		it('should NOT match version without v prefix', () => {
			const title = 'chore(release): 1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});
	});

	describe('Invalid Release PR Titles - Wrong Scope', () => {
		it('should NOT match with different scope', () => {
			const title = 'chore(deps): v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match without scope', () => {
			const title = 'chore: v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with wrong type', () => {
			const title = 'feat(release): v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});
	});

	describe('Invalid Release PR Titles - Wrong Spacing', () => {
		it('should NOT match without space after colon', () => {
			const title = 'chore(release):v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with space before colon', () => {
			const title = 'chore(release) : v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with space in scope', () => {
			const title = 'chore( release ): v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});
	});

	describe('Invalid Release PR Titles - Non-Semantic Versions', () => {
		it('should NOT match with two-part version', () => {
			const title = 'chore(release): v1.2';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with four-part version', () => {
			const title = 'chore(release): v1.2.3.4';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with single-part version', () => {
			const title = 'chore(release): v1';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with pre-release tags', () => {
			const title = 'chore(release): v1.2.3-alpha';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with build metadata', () => {
			const title = 'chore(release): v1.2.3+build.123';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with RC tags', () => {
			const title = 'chore(release): v1.2.3-rc.1';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});
	});

	describe('Invalid Release PR Titles - Non-Numeric Components', () => {
		it('should NOT match with letters in version', () => {
			const title = 'chore(release): v1.2.x';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with special characters', () => {
			const title = 'chore(release): v1.2.*';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});
	});

	describe('Invalid Release PR Titles - Extra Content', () => {
		it('should NOT match with trailing text', () => {
			const title = 'chore(release): v1.2.3 - Final release';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with leading text', () => {
			const title = 'Release: chore(release): v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with trailing whitespace', () => {
			const title = 'chore(release): v1.2.3 ';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with leading whitespace', () => {
			const title = ' chore(release): v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});
	});

	describe('Invalid Release PR Titles - Common Mistakes', () => {
		it('should NOT match conventional commits without scope', () => {
			const title = 'chore: release v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with capital letters', () => {
			const title = 'Chore(release): v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with capital V', () => {
			const title = 'chore(release): V1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with brackets instead of parentheses', () => {
			const title = 'chore[release]: v1.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match empty string', () => {
			const title = '';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});
	});

	describe('Real-World Examples from Project History', () => {
		it('should match actual release PR titles from this project', () => {
			// Based on git log pattern: chore(release): vX.Y.Z
			const realExamples = [
				'chore(release): v1.0.0',
				'chore(release): v1.0.1',
				'chore(release): v1.0.2',
				'chore(release): v1.0.3',
				'chore(release): v1.1.0',
			];

			realExamples.forEach((title) => {
				expect(isReleaseTitle(title)).toBe(true);
				expect(extractVersion(title)).toMatch(/^\d+\.\d+\.\d+$/);
			});
		});

		it('should NOT match non-release commit messages', () => {
			const nonReleaseExamples = [
				'feat: add operation-specific credential validation',
				'fix: revert node version to 1',
				'chore: update dependencies',
				'docs: update README',
				'test: add credential validation tests',
			];

			nonReleaseExamples.forEach((title) => {
				expect(isReleaseTitle(title)).toBe(false);
				expect(extractVersion(title)).toBeNull();
			});
		});
	});

	describe('Edge Cases', () => {
		it('should match with unicode whitespace characters', () => {
			// Non-breaking space (U+00A0) is considered whitespace by both \s and [[:space:]]
			// This is expected and correct behavior
			const title = 'chore(release):\u00A0v1.2.3';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('1.2.3');
		});

		it('should allow leading zeros in version numbers', () => {
			// While not standard semantic versioning, the pattern allows this
			const title = 'chore(release): v01.02.03';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('01.02.03');
		});

		it('should allow very long version numbers', () => {
			// Pattern allows any length of numeric components
			const title = 'chore(release): v1234567890.9876543210.1111111111';
			expect(isReleaseTitle(title)).toBe(true);
			expect(extractVersion(title)).toBe('1234567890.9876543210.1111111111');
		});
	});

	describe('Security & Injection Tests', () => {
		it('should NOT match with regex special characters in version', () => {
			const title = 'chore(release): v1.2.*';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with command injection attempts', () => {
			const title = 'chore(release): v1.2.3; rm -rf /';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with shell expansion attempts', () => {
			const title = 'chore(release): v$(whoami).2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});

		it('should NOT match with backtick execution', () => {
			const title = 'chore(release): v`echo 1`.2.3';
			expect(isReleaseTitle(title)).toBe(false);
			expect(extractVersion(title)).toBeNull();
		});
	});

	describe('Pattern Consistency', () => {
		it('should extract version correctly for all valid formats', () => {
			const testCases = [
				{ title: 'chore(release): v1.2.3', expected: '1.2.3' },
				{ title: 'chore(release):  v4.5.6', expected: '4.5.6' },
				{ title: 'chore(release):\tv7.8.9', expected: '7.8.9' },
				{ title: 'chore(release):   v10.11.12', expected: '10.11.12' },
			];

			testCases.forEach(({ title, expected }) => {
				expect(extractVersion(title)).toBe(expected);
			});
		});

		it('should return null for all invalid formats', () => {
			const invalidTitles = [
				'chore(release):v1.2.3',
				'chore(release): 1.2.3',
				'chore: v1.2.3',
				'release: v1.2.3',
				'chore(release): v1.2',
				'chore(release): v1.2.3.4',
			];

			invalidTitles.forEach((title) => {
				expect(extractVersion(title)).toBeNull();
			});
		});
	});
});
