// Pterodactyl API Type Definitions

export interface PterodactylPaginatedResponse<T> {
	object: 'list';
	data: T[];
	meta: {
		pagination: {
			total: number;
			count: number;
			per_page: number;
			current_page: number;
			total_pages: number;
			links: Record<string, string | null>;
		};
	};
}

export interface PterodactylServer {
	object: 'server';
	attributes: {
		server_owner: boolean;
		identifier: string;
		internal_id: number;
		uuid: string;
		name: string;
		node: string;
		sftp_details: {
			ip: string;
			port: number;
		};
		description: string;
		limits: {
			memory: number;
			swap: number;
			disk: number;
			io: number;
			cpu: number;
		};
		invocation: string;
		docker_image: string;
		egg_features: string[];
		feature_limits: {
			databases: number;
			allocations: number;
			backups: number;
		};
		status: string | null;
		is_suspended: boolean;
		is_installing: boolean;
		is_transferring: boolean;
	};
}

export interface PterodactylError {
	errors: Array<{
		code: string;
		status: string;
		detail: string;
		source?: {
			field?: string;
		};
		meta?: Record<string, unknown>;
	}>;
}

export interface PterodactylServerResources {
	object: 'stats';
	attributes: {
		current_state: string;
		is_suspended: boolean;
		resources: {
			memory_bytes: number;
			cpu_absolute: number;
			disk_bytes: number;
			network_rx_bytes: number;
			network_tx_bytes: number;
			uptime: number;
		};
	};
}

export interface PterodactylFile {
	object: 'file_object';
	attributes: {
		name: string;
		mode: string;
		mode_bits: string;
		size: number;
		is_file: boolean;
		is_symlink: boolean;
		mimetype: string;
		created_at: string;
		modified_at: string;
	};
}

export interface PterodactylDatabase {
	object: 'server_database';
	attributes: {
		id: string;
		host: {
			address: string;
			port: number;
		};
		name: string;
		username: string;
		connections_from: string;
		max_connections: number;
	};
}

export interface PterodactylBackup {
	object: 'backup';
	attributes: {
		uuid: string;
		is_successful: boolean;
		is_locked: boolean;
		name: string;
		ignored_files: string[];
		checksum: string | null;
		bytes: number;
		created_at: string;
		completed_at: string | null;
	};
}

export interface PterodactylAllocation {
	object: 'allocation';
	attributes: {
		id: number;
		ip: string;
		ip_alias: string | null;
		port: number;
		notes: string | null;
		is_default: boolean;
	};
}

export interface PterodactylSubuser {
	object: 'subuser';
	attributes: {
		uuid: string;
		username: string;
		email: string;
		image: string;
		'2fa_enabled': boolean;
		created_at: string;
		permissions: string[];
	};
}

export interface PterodactylSchedule {
	object: 'server_schedule';
	attributes: {
		id: number;
		name: string;
		cron: {
			day_of_week: string;
			day_of_month: string;
			hour: string;
			minute: string;
		};
		is_active: boolean;
		is_processing: boolean;
		last_run_at: string | null;
		next_run_at: string | null;
		created_at: string;
		updated_at: string;
	};
}

export interface PterodactylStartupVariable {
	object: 'egg_variable';
	attributes: {
		name: string;
		description: string;
		env_variable: string;
		default_value: string;
		server_value: string;
		is_editable: boolean;
		rules: string;
	};
}

// Application API Types

export interface PterodactylUser {
	object: 'user';
	attributes: {
		id: number;
		external_id: string | null;
		uuid: string;
		username: string;
		email: string;
		first_name: string;
		last_name: string;
		language: string;
		root_admin: boolean;
		'2fa': boolean;
		created_at: string;
		updated_at: string;
	};
}

export interface PterodactylNode {
	object: 'node';
	attributes: {
		id: number;
		uuid: string;
		public: boolean;
		name: string;
		description: string;
		location_id: number;
		fqdn: string;
		scheme: string;
		behind_proxy: boolean;
		maintenance_mode: boolean;
		memory: number;
		memory_overallocate: number;
		disk: number;
		disk_overallocate: number;
		upload_size: number;
		daemon_listen: number;
		daemon_sftp: number;
		daemon_base: string;
		created_at: string;
		updated_at: string;
	};
}

export interface PterodactylLocation {
	object: 'location';
	attributes: {
		id: number;
		short: string;
		long: string;
		updated_at: string;
		created_at: string;
	};
}

export interface PterodactylNest {
	object: 'nest';
	attributes: {
		id: number;
		uuid: string;
		author: string;
		name: string;
		description: string;
		created_at: string;
		updated_at: string;
	};
}

export interface PterodactylEgg {
	object: 'egg';
	attributes: {
		id: number;
		uuid: string;
		name: string;
		nest: number;
		author: string;
		description: string;
		docker_image: string;
		docker_images: Record<string, string>;
		config: {
			files: Record<string, unknown>;
			startup: Record<string, unknown>;
			stop: string;
			logs: Record<string, unknown>;
			file_denylist: string[];
			extends: string | null;
		};
		startup: string;
		script: {
			privileged: boolean;
			install: string;
			entry: string;
			container: string;
			extends: string | null;
		};
		created_at: string;
		updated_at: string;
	};
}
