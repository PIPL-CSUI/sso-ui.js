import type { CASVersion, LoginUrlOptions, LogoutUrlOptions } from "./types"

export const DEFAULT_CAS_URL = "https://sso.ui.ac.id/cas2"

export function normalize(url?: string): string 
{
    return (url || DEFAULT_CAS_URL).trim().replace(/\/+$/, "")
}


export function LoginURL(casUrl: string, serviceUrl?: string, options?: LoginUrlOptions): string 
{
    const url = new URL(`${normalize(casUrl)}/login`)

    const serv = options?.serviceUrl || serviceUrl
    if (serv) url.searchParams.set("service", serv)
    
    if (options?.renew)   url.searchParams.set("renew", "true")
    if (options?.gateway) url.searchParams.set("gateway", "true")

    return url.toString()
}


export function LogoutURL(casUrl: string, options?: LogoutUrlOptions): string 
{
    const url = new URL(`${normalize(casUrl)}/logout`)

    const redir = options?.url || options?.serviceUrl
    
    if (redir) 
    {
        url.searchParams.set("url",     redir)
        url.searchParams.set("service", redir) // meh
    }

    return url.toString()
}



export function ValidateURL(casUrl: string, serviceUrl: string, ticket: string, version: CASVersion = "2.0"): string 
{
    let path = "/serviceValidate"

    if (version === "1.0")      path = "/validate"
    else if (version === "3.0") path = "/p3/serviceValidate"

    const url = new URL(`${normalize(casUrl)}${path}`)
    
    url.searchParams.set("service", serviceUrl)
    url.searchParams.set("ticket", ticket)

    return url.toString()
}
