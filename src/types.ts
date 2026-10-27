/**
 * * `"1.0"`: `/validate`
 * * `"2.0"`: `/serviceValidate`
 * * `"3.0"`: `/p3/serviceValidate`
 */
export type CASVersion = "1.0" | "2.0" | "3.0"

/**
 * the vocabulary for kd_org field
 */
export interface OrgDetails
{
	/** Faculty name in id. e.g. Fakultas Ilmu Komputer */
    fakultas: string
	/** Faculty name in en. e.g. Faculty of Computer Science */
    faculty:  string

	/** Short name in id. e.g. Fasilkom, FT, FK; vernacular names */
    fak: string
	/** Short name in en. e.g. CS, SCI; based on faculty homepage subdomain */
    fac: string

	/** Department name in id, based on the faculty. e.g. Departemen Matematika */
    departemen: string
	/** Department name in en, based on the faculty. e.g. Department of Mathematics */
    department: string

	/** Department short name. e.g. DTE, MATH */
    dep: string

    /** Major name in id. e.g. Sarjana Ilmu Komputer */
    prodi: string
	/** Major name in en. e.g. Bachelor of Computer Science */
    major: string

    // backward compat
	/** Alias for {@linkcode prodi} */
    studyProgram?: string
	/** jenjang */
    educationalProgram?: string
}

/**
 * user but normalized
 */
export interface SSOUser
{
	/** SSO username */
    username: string
	/** Full name */
    name: string

    role: "mahasiswa" | "staff" | string

	/** NPM if {@linkcode role} is `"mahasiswa"` */
    npm?: string
	/** NPM if {@linkcode role} is `"staff"` */
    nip?: string

	/** Organization code; `kd_org` */
    orgCode?: string

    organization?: OrgDetails

	/** Common name for LDAP */
    ldapCn?: string

	/** Raw attributes */
    rawAttributes: Record<string, string>
}


export interface SSOConfig
{
    /**
    * base url
    * @default "https://sso.ui.ac.id/cas2"
    */
    casUrl?: string

    /**
    * @default "2.0"
    */
    version?: CASVersion

    /**
    * callback url for your app
    */
    serviceUrl?: string

    /**
    * @default 10000
    */
    timeoutMs?: number

    fetch?: typeof globalThis.fetch // this one gonna defaults to globalThis.fetch
}


export interface LoginUrlOptions
{
	/** URL to redirect after the login */
    serviceUrl?: string

    renew?: boolean
    gateway?: boolean
}


export interface LogoutUrlOptions
{
    serviceUrl?: string

    url?: string
}


export interface ValidateTicketOptions
{
    serviceUrl?: string //

    version?: CASVersion //

    signal?: AbortSignal //

    fetchOptions?: RequestInit //
}

////

export type res =
| {
    success: true;
    user: SSOUser;
    error?: never
}
| {
    success: false;
    user?: never;
    error: Error
}
