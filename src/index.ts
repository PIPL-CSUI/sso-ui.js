import { XMLParser } from "fast-xml-parser"

import { DEFAULT_CAS_URL, normalize, LoginURL, LogoutURL, ValidateURL, } from "./endpoint"
import { lookupOrgCode, ORG_CODES, type RawOrgEntry } from "./kd_org/code"

import type { CASVersion, OrgDetails, SSOUser, SSOConfig, LoginUrlOptions, LogoutUrlOptions, ValidateTicketOptions, res, } from "./types"

const xmlParser = new XMLParser({
    removeNSPrefix: true,
    trimValues: true,
    parseTagValue: false,
})

export function parseResponse(body: string, version: CASVersion = "2.0"): SSOUser 
{
    if (version === "1.0") 
    {
        const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        
        if (lines[0]?.toLowerCase() === "yes" && lines[1]) 
        {
            return {
                username: lines[1],
                name: lines[1],
                role: "unknown",
                rawAttributes: { username: lines[1] },
            }
        }
        
        throw new Error(lines[0]?.toLowerCase() === "no" ? "CAS 1.0 ticket validation failed" : `Invalid CAS 1.0 response: ${body}`)
    }


    const trimmed = body.trim()

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) 
    {
        const data  = JSON.parse(trimmed)
        const sResp = data.serviceResponse || data
        
        if (sResp.authenticationFailure) 
        {
            throw new Error(`SSO validation failed: ${sResp.authenticationFailure.description || sResp.authenticationFailure.code}`)
        }
        
        const success = sResp.authenticationSuccess
        
        if (!success?.user) {
            throw new Error("Missing authenticationSuccess in CAS JSON response")
        }
        
        const attrs: Record<string, string> = {}
        
        if (success.attributes) 
        {
            for (const [k, v] of Object.entries(success.attributes)) {
                attrs[k] = String(Array.isArray(v) ? v[0] : v).trim()
            }
        }
        
        return buildUser(String(success.user).trim(), attrs)
    }


    const parsed = xmlParser.parse(trimmed)
    const sResp  = parsed?.serviceResponse || parsed

    if (sResp?.authenticationFailure) 
    {
        const fail = sResp.authenticationFailure
    
        const code = typeof fail === "object" ? fail["@_code"] : undefined
        const desc = typeof fail === "object" ? fail["#text"] || JSON.stringify(fail) : fail
    
        throw new Error(`SSO validation failed (${code || "FAILED"}): ${desc}`)
    }

    const success = sResp?.authenticationSuccess
    
    if (!success?.user) 
    {
        throw new Error("Missing authenticationSuccess in CAS XML response")
    }

    const username = String(success.user).trim()
    const rawAttrs = success.attributes || {}
    
    const attrs: Record<string, string> = {}


    for (const [k, v] of Object.entries(rawAttrs)) 
    {
        if (!k.startsWith("@_")) 
        {
            attrs[k] = String(Array.isArray(v) ? v[0] : v).trim()
        }
    }

    for (const [k, v] of Object.entries(success)) 
    {
        if (k !== "user" && k !== "attributes" && !k.startsWith("@_") && typeof v !== "object") 
        {
            if (!attrs[k]) attrs[k] = String(v).trim()
        }
    }

    return buildUser(username, attrs)
}

function buildUser(username: string, attrs: Record<string, string>): SSOUser 
{
    const role    = (attrs.peran_user || attrs.role || "unknown").toLowerCase()
    const orgCode = attrs.kd_org || attrs.org_code || undefined

    return {
        username,
        name: attrs.nama || attrs.name || attrs.ldap_cn || username,
        role,
        npm: attrs.npm || undefined,
        nip: attrs.nip || undefined,
        orgCode,
        organization: lookupOrgCode(orgCode),
        ldapCn: attrs.ldap_cn || undefined,
        rawAttributes: attrs,
    }
}

export class SSO 
{
    public casUrl: string
    public serviceUrl?: string
    public version: CASVersion
    public timeoutMs: number
    public fetchFn: typeof globalThis.fetch

    constructor(config: SSOConfig = {}) 
    {
        this.casUrl     = normalize(config.casUrl || DEFAULT_CAS_URL)
        
        this.serviceUrl = config.serviceUrl
        this.version    = config.version || "2.0"
        this.timeoutMs  = config.timeoutMs ?? 10000
        this.fetchFn    = config.fetch || globalThis.fetch
    }

    loginUrl(serviceUrl?: string, options?: LoginUrlOptions): string 
    {
        return LoginURL(this.casUrl, serviceUrl || this.serviceUrl, options)
    }

    logoutUrl(options?: LogoutUrlOptions | string): string 
    {
        if (typeof options === "string") 
        {
            return LogoutURL(this.casUrl, { 
                url: options 
            })
        }
        
        return LogoutURL(this.casUrl, { 
            serviceUrl: this.serviceUrl, 
            ...options 
        })
    }


    async validate(ticket: string, options?: ValidateTicketOptions | string): Promise<SSOUser> 
    {
        if (!ticket) throw new Error("Ticket is required")

        const serviceUrl = typeof options === "string" ? options : options?.serviceUrl || this.serviceUrl
        if (!serviceUrl) throw new Error("serviceUrl is required for ticket validation")

        const version = (typeof options === "object" && options?.version) || this.version
        const url     = ValidateURL(this.casUrl, serviceUrl, ticket.trim(), version)

        const controller = new AbortController()
        const timeout    = setTimeout(() => controller.abort(), this.timeoutMs)

        if (typeof options === "object" && options?.signal) 
        {
            options.signal.addEventListener("abort", () => controller.abort(options.signal?.reason), { once: true })
        }

        try 
        {
            const resp = await this.fetchFn(url, {
                method: "GET",
                signal: controller.signal,
                
                headers: {
                    Accept: version === "3.0" ? "application/json, application/xml, text/xml, */*" : "application/xml, text/xml, */*",
                    
                    ...(typeof options === "object" ? options?.fetchOptions?.headers : {}),
                },
                
                ...(typeof options === "object" ? options?.fetchOptions : {}),
            })

            const text = await resp.text()
            
            return parseResponse(text, version)
        } 
        
        finally 
        {
            clearTimeout(timeout)
        }
    }


    async validateSafe(ticket: string, options?: ValidateTicketOptions | string): Promise<res> 
    {
        try 
        {
            const user = await this.validate(ticket, options)
        
            return { 
                success: true, 
                user 
            }
        } 
        
        catch (err: any) 
        {
            return { 
                success: false, 
                error: err instanceof Error ? err : new Error(String(err)) 
            }
        }
    }
}



export {
    DEFAULT_CAS_URL,
    normalize,
    LoginURL,
    LogoutURL,
    ValidateURL,
    lookupOrgCode,
    ORG_CODES,
}

export type {
    CASVersion,
    OrgDetails,
    SSOUser,
    SSOConfig,
    LoginUrlOptions,
    LogoutUrlOptions,
    ValidateTicketOptions,
    res,
    RawOrgEntry,
}

export default SSO
