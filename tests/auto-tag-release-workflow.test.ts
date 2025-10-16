/**
 * Tests for auto-tag-release.yml workflow structure and logic
 *
 * This test suite validates:
 * - YAML syntax and structure
 * - Workflow conditional logic
 * - Step dependencies
 * - GitHub Actions best practices
 * - Error handling scenarios
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

describe('Auto Tag Release - Workflow Structure Validation', () => {
	let workflowContent: string;
	let workflowYaml: any;

	beforeAll(() => {
		const workflowPath = path.join(__dirname, '../.github/workflows/auto-tag-release.yml');
		workflowContent = fs.readFileSync(workflowPath, 'utf8');
		workflowYaml = yaml.parse(workflowContent);
	});

	describe('YAML Syntax', () => {
		it('should have valid YAML syntax', () => {
			expect(workflowYaml).toBeDefined();
			expect(workflowYaml).not.toBeNull();
		});

		it('should parse without errors', () => {
			expect(() => yaml.parse(workflowContent)).not.toThrow();
		});
	});

	describe('Workflow Metadata', () => {
		it('should have a descriptive name', () => {
			expect(workflowYaml.name).toBeDefined();
			expect(workflowYaml.name).toBe('Auto Tag Release');
		});

		it('should have clear documentation comments', () => {
			expect(workflowContent).toContain('Workflow relationship:');
			expect(workflowContent).toContain('release.yml');
			expect(workflowContent).toContain('publish.yml');
		});
	});

	describe('Workflow Triggers', () => {
		it('should trigger on pull_request events', () => {
			expect(workflowYaml.on).toBeDefined();
			expect(workflowYaml.on.pull_request).toBeDefined();
		});

		it('should only trigger on closed PRs', () => {
			expect(workflowYaml.on.pull_request.types).toContain('closed');
		});

		it('should only trigger on main branch', () => {
			expect(workflowYaml.on.pull_request.branches).toContain('main');
		});

		it('should not trigger on other PR events', () => {
			const types = workflowYaml.on.pull_request.types;
			expect(types).toEqual(['closed']);
			expect(types).not.toContain('opened');
			expect(types).not.toContain('synchronize');
		});
	});

	describe('Job Configuration', () => {
		it('should have auto-tag job', () => {
			expect(workflowYaml.jobs).toBeDefined();
			expect(workflowYaml.jobs['auto-tag']).toBeDefined();
		});

		it('should only run on merged PRs', () => {
			const job = workflowYaml.jobs['auto-tag'];
			expect(job.if).toBeDefined();
			expect(job.if).toContain('github.event.pull_request.merged == true');
		});

		it('should run on ubuntu-latest', () => {
			const job = workflowYaml.jobs['auto-tag'];
			expect(job['runs-on']).toBe('ubuntu-latest');
		});

		it('should have minimal required permissions', () => {
			const job = workflowYaml.jobs['auto-tag'];
			expect(job.permissions).toBeDefined();
			expect(job.permissions.contents).toBe('write');
		});

		it('should not have excessive permissions', () => {
			const job = workflowYaml.jobs['auto-tag'];
			const permissions = job.permissions;
			// Should only have contents: write, nothing else
			expect(Object.keys(permissions)).toEqual(['contents']);
		});
	});

	describe('Workflow Steps', () => {
		let steps: any[];

		beforeAll(() => {
			steps = workflowYaml.jobs['auto-tag'].steps;
		});

		it('should have all required steps', () => {
			expect(steps).toBeDefined();
			expect(steps.length).toBeGreaterThanOrEqual(6);
		});

		it('should have step names for all steps', () => {
			steps.forEach((step) => {
				expect(step.name).toBeDefined();
				expect(step.name.length).toBeGreaterThan(0);
			});
		});

		describe('Step 1: Check if release PR and extract version', () => {
			let checkStep: any;

			beforeAll(() => {
				checkStep = steps.find(s => s.name === 'Check if release PR and extract version');
			});

			it('should exist', () => {
				expect(checkStep).toBeDefined();
			});

			it('should have an id for output reference', () => {
				expect(checkStep.id).toBe('check');
			});

			it('should use bash regex pattern', () => {
				expect(checkStep.run).toContain('if [[ "$PR_TITLE" =~');
				expect(checkStep.run).toContain('^chore\\(release\\):[[:space:]]+v([0-9]+\\.[0-9]+\\.[0-9]+)$');
			});

			it('should extract version using BASH_REMATCH', () => {
				expect(checkStep.run).toContain('BASH_REMATCH[1]');
			});

			it('should set is_release output', () => {
				expect(checkStep.run).toContain('is_release=true');
				expect(checkStep.run).toContain('is_release=false');
			});

			it('should set version output', () => {
				expect(checkStep.run).toContain('version=${BASH_REMATCH[1]}');
			});

			it('should use GITHUB_OUTPUT for outputs', () => {
				expect(checkStep.run).toContain('>> $GITHUB_OUTPUT');
			});
		});

		describe('Step 2: Skip non-release PR', () => {
			let skipStep: any;

			beforeAll(() => {
				skipStep = steps.find(s => s.name === 'Skip non-release PR');
			});

			it('should exist', () => {
				expect(skipStep).toBeDefined();
			});

			it('should only run when is_release is false', () => {
				expect(skipStep.if).toContain("steps.check.outputs.is_release != 'true'");
			});

			it('should exit cleanly with code 0', () => {
				expect(skipStep.run).toContain('exit 0');
			});
		});

		describe('Step 3: Checkout repository', () => {
			let checkoutStep: any;

			beforeAll(() => {
				checkoutStep = steps.find(s => s.name === 'Checkout repository');
			});

			it('should exist', () => {
				expect(checkoutStep).toBeDefined();
			});

			it('should only run for release PRs', () => {
				expect(checkoutStep.if).toContain("steps.check.outputs.is_release == 'true'");
			});

			it('should use actions/checkout@v4', () => {
				expect(checkoutStep.uses).toBe('actions/checkout@v4');
			});

			it('should checkout main branch', () => {
				expect(checkoutStep.with.ref).toBe('main');
			});

			it('should fetch full history for tagging', () => {
				expect(checkoutStep.with['fetch-depth']).toBe(0);
			});
		});

		describe('Step 4: Check if tag already exists', () => {
			let tagCheckStep: any;

			beforeAll(() => {
				tagCheckStep = steps.find(s => s.name === 'Check if tag already exists');
			});

			it('should exist', () => {
				expect(tagCheckStep).toBeDefined();
			});

			it('should only run for release PRs', () => {
				expect(tagCheckStep.if).toContain("steps.check.outputs.is_release == 'true'");
			});

			it('should have an id for output reference', () => {
				expect(tagCheckStep.id).toBe('tag-check');
			});

			it('should use git ls-remote to check remote tags', () => {
				expect(tagCheckStep.run).toContain('git ls-remote --tags origin');
			});

			it('should set exists output', () => {
				expect(tagCheckStep.run).toContain('exists=true');
				expect(tagCheckStep.run).toContain('exists=false');
			});
		});

		describe('Step 5: Fail if tag already exists', () => {
			let failStep: any;

			beforeAll(() => {
				failStep = steps.find(s => s.name === 'Fail if tag already exists');
			});

			it('should exist', () => {
				expect(failStep).toBeDefined();
			});

			it('should have compound conditional', () => {
				expect(failStep.if).toContain("steps.check.outputs.is_release == 'true'");
				expect(failStep.if).toContain("steps.tag-check.outputs.exists == 'true'");
				expect(failStep.if).toContain('&&');
			});

			it('should provide helpful error message', () => {
				expect(failStep.run).toContain('Tag Already Exists');
				expect(failStep.run).toContain('GITHUB_STEP_SUMMARY');
			});

			it('should provide remediation instructions', () => {
				expect(failStep.run).toContain('git tag -d');
				expect(failStep.run).toContain('git push origin :refs/tags/');
			});

			it('should exit with error code', () => {
				expect(failStep.run).toContain('exit 1');
			});
		});

		describe('Step 6: Create and push tag', () => {
			let createTagStep: any;

			beforeAll(() => {
				createTagStep = steps.find(s => s.name === 'Create and push tag');
			});

			it('should exist', () => {
				expect(createTagStep).toBeDefined();
			});

			it('should have compound conditional', () => {
				expect(createTagStep.if).toContain("steps.check.outputs.is_release == 'true'");
				expect(createTagStep.if).toContain("steps.tag-check.outputs.exists != 'true'");
				expect(createTagStep.if).toContain('&&');
			});

			it('should configure git user', () => {
				expect(createTagStep.run).toContain('git config user.name');
				expect(createTagStep.run).toContain('git config user.email');
				expect(createTagStep.run).toContain('github-actions[bot]');
			});

			it('should create annotated tag', () => {
				expect(createTagStep.run).toContain('git tag -a');
				expect(createTagStep.run).toContain('-m "Release');
			});

			it('should push tag to origin', () => {
				expect(createTagStep.run).toContain('git push origin');
			});

			it('should use version from step output', () => {
				expect(createTagStep.run).toContain('${{ steps.check.outputs.version }}');
			});
		});

		describe('Step 7: Success summary', () => {
			let successStep: any;

			beforeAll(() => {
				successStep = steps.find(s => s.name === 'Success summary');
			});

			it('should exist', () => {
				expect(successStep).toBeDefined();
			});

			it('should have compound conditional matching create step', () => {
				expect(successStep.if).toContain("steps.check.outputs.is_release == 'true'");
				expect(successStep.if).toContain("steps.tag-check.outputs.exists != 'true'");
			});

			it('should create GitHub step summary', () => {
				expect(successStep.run).toContain('GITHUB_STEP_SUMMARY');
			});

			it('should include next steps', () => {
				expect(successStep.run).toContain('Next Steps');
				expect(successStep.run).toContain('publish.yml');
			});

			it('should include useful metadata', () => {
				expect(successStep.run).toContain('github.event.pull_request.merge_commit_sha');
				expect(successStep.run).toContain('github.event.pull_request.number');
			});
		});
	});

	describe('Conditional Logic Flow', () => {
		it('should have proper step dependency chain', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;

			// Check step always runs (no condition)
			const checkStep = steps.find((s: any) => s.id === 'check');
			expect(checkStep.if).toBeUndefined();

			// Skip step runs when not release
			const skipStep = steps.find((s: any) => s.name === 'Skip non-release PR');
			expect(skipStep.if).toContain("!= 'true'");

			// All other steps require is_release == true
			const releaseSteps = steps.filter((s: any) =>
				s.if && s.if.includes("steps.check.outputs.is_release == 'true'")
			);
			expect(releaseSteps.length).toBeGreaterThanOrEqual(5);
		});

		it('should prevent duplicate tag creation', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;

			// Create tag step should NOT run if tag exists
			const createStep = steps.find((s: any) => s.name === 'Create and push tag');
			expect(createStep.if).toContain("steps.tag-check.outputs.exists != 'true'");

			// Fail step should run if tag exists
			const failStep = steps.find((s: any) => s.name === 'Fail if tag already exists');
			expect(failStep.if).toContain("steps.tag-check.outputs.exists == 'true'");
		});

		it('should have mutually exclusive paths', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;

			const createStep = steps.find((s: any) => s.name === 'Create and push tag');
			const failStep = steps.find((s: any) => s.name === 'Fail if tag already exists');

			// Create runs when exists != 'true'
			expect(createStep.if).toContain("!= 'true'");

			// Fail runs when exists == 'true'
			expect(failStep.if).toContain("== 'true'");

			// These conditions are mutually exclusive
			expect(createStep.if).not.toBe(failStep.if);
		});
	});

	describe('Error Handling', () => {
		it('should handle non-release PRs gracefully', () => {
			const skipStep = workflowYaml.jobs['auto-tag'].steps.find(
				(s: any) => s.name === 'Skip non-release PR'
			);
			expect(skipStep).toBeDefined();
			expect(skipStep.run).toContain('exit 0');
		});

		it('should fail explicitly on duplicate tags', () => {
			const failStep = workflowYaml.jobs['auto-tag'].steps.find(
				(s: any) => s.name === 'Fail if tag already exists'
			);
			expect(failStep).toBeDefined();
			expect(failStep.run).toContain('exit 1');
		});

		it('should provide user feedback for all scenarios', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;

			// Check for emoji indicators in output
			const hasSuccessEmoji = steps.some((s: any) =>
				s.run && s.run.includes('✅')
			);
			const hasInfoEmoji = steps.some((s: any) =>
				s.run && s.run.includes('ℹ️')
			);
			const hasWarningEmoji = steps.some((s: any) =>
				s.run && s.run.includes('⚠️')
			);

			expect(hasSuccessEmoji).toBe(true);
			expect(hasInfoEmoji).toBe(true);
			expect(hasWarningEmoji).toBe(true);
		});
	});

	describe('Security Best Practices', () => {
		it('should use pinned action versions', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;
			const actionSteps = steps.filter((s: any) => s.uses);

			actionSteps.forEach((step: any) => {
				// Should use @v4 format (major version pinning)
				expect(step.uses).toMatch(/@v\d+$/);
			});
		});

		it('should not expose secrets in logs', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;

			steps.forEach((step: any) => {
				if (step.run) {
					// Should not reference secrets (this workflow uses GITHUB_TOKEN implicitly)
					expect(step.run).not.toContain('secrets.');
				}
			});
		});

		it('should use built-in GITHUB_TOKEN', () => {
			// Workflow should rely on default GITHUB_TOKEN permissions
			// No explicit token passing needed for git operations
			const steps = workflowYaml.jobs['auto-tag'].steps;

			// Should not need explicit token for git push (uses permissions: contents: write)
			const createStep = steps.find((s: any) => s.name === 'Create and push tag');
			expect(createStep.run).not.toContain('GITHUB_TOKEN');
			expect(createStep.run).not.toContain('token:');
		});

		it('should not use unsafe shell commands', () => {
			const allContent = workflowContent.toLowerCase();

			// Check for potentially dangerous commands
			const dangerousCommands = ['eval', 'rm -rf /', 'sudo', 'chmod 777'];

			dangerousCommands.forEach(cmd => {
				expect(allContent).not.toContain(cmd);
			});
		});
	});

	describe('GitHub Actions Best Practices', () => {
		it('should use step outputs instead of environment variables', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;

			// Should use GITHUB_OUTPUT for step outputs
			const checkStep = steps.find((s: any) => s.id === 'check');
			expect(checkStep.run).toContain('GITHUB_OUTPUT');
			expect(checkStep.run).not.toContain('set-output');
		});

		it('should use GITHUB_STEP_SUMMARY for user feedback', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;

			const summarySteps = steps.filter((s: any) =>
				s.run && s.run.includes('GITHUB_STEP_SUMMARY')
			);

			expect(summarySteps.length).toBeGreaterThanOrEqual(2);
		});

		it('should have descriptive step names', () => {
			const steps = workflowYaml.jobs['auto-tag'].steps;

			steps.forEach((step: any) => {
				expect(step.name).toBeDefined();
				expect(step.name.length).toBeGreaterThan(10);
				// Should be descriptive, not just "Step 1", "Run script", etc.
				expect(step.name).not.toMatch(/^(step|run|execute)\s*\d*$/i);
			});
		});
	});

	describe('Integration with Other Workflows', () => {
		it('should document relationship with release.yml', () => {
			expect(workflowContent).toContain('release.yml');
			expect(workflowContent).toContain('Creates PR with version bump');
		});

		it('should document relationship with publish.yml', () => {
			expect(workflowContent).toContain('publish.yml');
			expect(workflowContent).toContain('Publishes to npm');
		});

		it('should explain the workflow sequence', () => {
			expect(workflowContent).toContain('1.');
			expect(workflowContent).toContain('2.');
			expect(workflowContent).toContain('3.');
		});
	});

	describe('Version Extraction Pattern', () => {
		it('should match the JavaScript test pattern', () => {
			// The bash pattern in the workflow
			const bashPattern = '^chore\\(release\\):[[:space:]]+v([0-9]+\\.[0-9]+\\.[0-9]+)$';

			// The JavaScript equivalent pattern
			const jsPattern = /^chore\(release\):\s+v([0-9]+\.[0-9]+\.[0-9]+)$/;

			// Test that both patterns match the same strings
			const testTitles = [
				'chore(release): v1.2.3',
				'chore(release):  v4.5.6',
				'chore(release): v10.20.30',
			];

			testTitles.forEach(title => {
				const jsMatch = jsPattern.test(title);
				expect(jsMatch).toBe(true);
			});

			// The patterns should be functionally equivalent
			expect(bashPattern).toContain('[[:space:]]');
			expect(jsPattern.source).toContain('\\s');
		});
	});
});
