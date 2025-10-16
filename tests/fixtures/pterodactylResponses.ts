/**
 * Sample API responses for testing
 */

export const sampleServerResponse = {
	object: 'server',
	attributes: {
		server_owner: true,
		identifier: 'abc12def',
		internal_id: 11,
		uuid: 'abc12def-1234-5678-9abc-def123456789',
		name: 'Test Server',
		node: 'Node 1',
		sftp_details: {
			ip: '192.168.1.1',
			port: 2022,
		},
		description: 'A test server',
		limits: {
			memory: 2048,
			swap: 0,
			disk: 5000,
			io: 500,
			cpu: 100,
		},
		invocation: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
		docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
		egg_features: [],
		feature_limits: {
			databases: 2,
			allocations: 5,
			backups: 3,
		},
		status: null,
		is_suspended: false,
		is_installing: false,
		is_transferring: false,
	},
};

export const sampleServerListResponse = {
	object: 'list',
	data: [sampleServerResponse],
	meta: {
		pagination: {
			total: 1,
			count: 1,
			per_page: 50,
			current_page: 1,
			total_pages: 1,
			links: {},
		},
	},
};

export const sampleResourcesResponse = {
	object: 'stats',
	attributes: {
		current_state: 'running',
		is_suspended: false,
		resources: {
			memory_bytes: 1073741824,
			cpu_absolute: 25.5,
			disk_bytes: 2147483648,
			network_rx_bytes: 1024000,
			network_tx_bytes: 512000,
			uptime: 3600000,
		},
	},
};

export const sampleDatabaseResponse = {
	object: 'server_database',
	attributes: {
		id: 'abc123',
		server: 11,
		host: 1,
		database: 's11_testdb',
		username: 'u11_testuser',
		remote: '%',
		max_connections: 0,
		created_at: '2024-01-01T00:00:00+00:00',
		updated_at: '2024-01-01T00:00:00+00:00',
		relationships: {
			password: {
				object: 'database_password',
				attributes: {
					password: 'test_password_123',
				},
			},
		},
	},
};

export const sampleBackupResponse = {
	object: 'backup',
	attributes: {
		uuid: 'backup-uuid-123',
		name: 'test-backup',
		ignored_files: [],
		sha256_hash: null,
		bytes: 0,
		created_at: '2024-01-01T00:00:00+00:00',
		completed_at: null,
	},
};

export const sampleFileListResponse = {
	object: 'list',
	data: [
		{
			object: 'file_object',
			attributes: {
				name: 'server.properties',
				mode: '-rw-r--r--',
				mode_bits: '0644',
				size: 1024,
				is_file: true,
				is_symlink: false,
				mimetype: 'text/plain',
				created_at: '2024-01-01T00:00:00+00:00',
				modified_at: '2024-01-01T00:00:00+00:00',
			},
		},
		{
			object: 'file_object',
			attributes: {
				name: 'plugins',
				mode: 'drwxr-xr-x',
				mode_bits: '0755',
				size: 4096,
				is_file: false,
				is_symlink: false,
				mimetype: 'inode/directory',
				created_at: '2024-01-01T00:00:00+00:00',
				modified_at: '2024-01-01T00:00:00+00:00',
			},
		},
	],
};

export const sampleAccountResponse = {
	object: 'user',
	attributes: {
		id: 1,
		admin: false,
		username: 'testuser',
		email: 'test@example.com',
		first_name: 'Test',
		last_name: 'User',
		language: 'en',
	},
};

export const samplePaginatedResponse = {
	object: 'list',
	data: [sampleServerResponse],
	meta: {
		pagination: {
			total: 100,
			count: 50,
			per_page: 50,
			current_page: 1,
			total_pages: 2,
			links: {
				next: 'https://panel.example.com/api/client?page=2',
			},
		},
	},
};
