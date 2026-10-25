/**
 * 1.0": /validate
 * 2.0": /serviceValidate
 * 3.0": /p3/serviceValidate
 */
export type CASVersion = "1.0" | "2.0" | "3.0"

/**
 * the vocabulary for kd_org field
 */
export interface OrgDetails 
{
    fakultas: string // faculty name in id.  Ex: Fakultas Ilmu Komputer
    faculty:  string // faculty name in en.  Ex: Faculty of Computer Science
    
    fak: string // short name in id.  Ex: Fasilkom, FT, FK; vernacular names
    fac: string // short name in en.  Ex: CS, SCI; based on faculty homepage subdomain
    
    departemen: string // department name in id, based on the faculty.  Ex: Departemen Matematika
    department: string // department name in en, based on the faculty.  Ex: Department of Mathematics

    dep: string // department short name. Ex: DTE, MATH

    // this ones kinda meh
    prodi: string // major name in id.  Ex: Sarjana Ilmu Komputer
    major: string // major name in en.  Ex: Bachelor of Computer Science

    // backward compat
    studyProgram?: string        // alias for prodi
    educationalProgram?: string  // jenjang
}

/**
 * user but normalized
 */
export interface SSOUser 
{
    username: string // SSO username
    name: string     // full name
    
    role: "mahasiswa" | "staff" | string
    
    npm?: string // npm if "mahasiswa"
    nip?: string // nip if "staff"
    
    orgCode?: string // organization code; kd_org
    
    organization?: OrgDetails

    ldapCn?: string // common name for LDAP

    rawAttributes: Record<string, string> // raw
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
    serviceUrl?: string // URL to redirect after the login

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
