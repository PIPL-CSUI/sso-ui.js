import { SSO } from "../dist/index"
import * as express from "express"
import { randomBytes } from "node:crypto"

const sessions = new Map<string, { username: string; name: string; role: string }>()

const origin = process.env.APP_ORIGIN ?? "http://localhost:3000"
const port   = Number(process.env.PORT || new URL(origin).port || 3000)
const cookie = "sso_session_idk"
const secure = new URL(origin).protocol === "https:" ? "; Secure" : ""
const sso    = new SSO({ serviceUrl: `${origin}/auth/callback` })

const app = express()

function getSessionId(cookieContent = "") 
{
    return cookieContent
        .split(";")
        .map(value => value.trim())
        .find(value => value.startsWith(`${cookie}=`))
        ?.slice(cookie.length + 1)
}

app.get("/login", (_req, res) => 
{
    res.redirect(sso.loginUrl())
})


app.get("/auth/callback", async (req, res) => 
{
    const ticket = req.query.ticket
    
    if (typeof ticket !== "string") 
    {
        res.status(400).send("Missing CAS ticket")
    
        return
    }

    const result = await sso.validateSafe(ticket)

    // console.log(result)
    
    if (!result.success) 
    {     
        res.status(401).send("SSO login failed")
        return
    }

    const sid = randomBytes(32).toString("hex")
    
    sessions.set(sid, result.user)
    
    res.setHeader("Set-Cookie", `${cookie}=${sid}; HttpOnly; SameSite=Lax; Path=/${secure}`)
    res.redirect("/")
})

app.get("/", (req, res) => 
{
    const sid  = getSessionId(req.headers.cookie)
    const user = sid ? sessions.get(sid) : undefined
    
    if (!user) 
    {
        res.redirect("/login")
    
        return
    }

    res.json({ user })
})

app.post("/logout", (req, res) => 
{
    const sid = getSessionId(req.headers.cookie)

    if (sid) sessions.delete(sid)

    res.setHeader("Set-Cookie", `${cookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`)
    res.redirect(sso.logoutUrl(origin))
})

app.listen(port, () => console.log(`Server listening at ${origin}`))
