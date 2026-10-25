// ceritanya vocabulary untuk kd_org field
import type { OrgDetails } from "../types"
import { ORG_CODES, type RawOrgEntry } from "./codes"

export { ORG_CODES, type RawOrgEntry }

// meh
const FACULTY_EN_MAP: Record<string, { en: string; fac: string }> = {
    "Kedokteran": { en: "Faculty of Medicine", fac: "FK" },
    "Kedokteran Gigi": { en: "Faculty of Dentistry", fac: "FKG" },
    "Matematika & Ilmu Pengetahuan Alam": { en: "Faculty of Mathematics and Natural Sciences", fac: "SCI" },
    "Teknik": { en: "Faculty of Engineering", fac: "ENG" },
    "Hukum": { en: "Faculty of Law", fac: "LAW" },
    "Ekonomi": { en: "Faculty of Economics and Business", fac: "FEB" },
    "Ekonomi & Bisnis": { en: "Faculty of Economics and Business", fac: "FEB" },
    "Ilmu Pengetahuan Budaya": { en: "Faculty of Humanities", fac: "HUM" },
    "Psikologi": { en: "Faculty of Psychology", fac: "FPSI" },
    "Ilmu Sosial & Ilmu Politik": { en: "Faculty of Social and Political Sciences", fac: "FISIP" },
    "Kesehatan Masyarakat": { en: "Faculty of Public Health", fac: "FKM" },
    "Ilmu Komputer": { en: "Faculty of Computer Science", fac: "CS" },
    "Ilmu Keperawatan": { en: "Faculty of Nursing", fac: "FIK" },
    "Farmasi": { en: "Faculty of Pharmacy", fac: "PHARM" },
    "Ilmu Administrasi": { en: "Faculty of Administrative Sciences", fac: "FIA" },
    "Program Pendidikan Vokasi": { en: "Vocational Education Program", fac: "VOKASI" },
    "Sekolah Ilmu Lingkungan": { en: "School of Environmental Science", fac: "SIL" },
    "Sekolah Kajian Stratejik & Global": { en: "School of Strategic and Global Studies", fac: "SKSG" },
}


export function lookupOrgCode(code?: string): OrgDetails | undefined 
{
    if (!code) return undefined
    
    const raw = ORG_CODES[code.trim()]
    
    if (!raw) return undefined

    const facultyId = raw.faculty
    const fak = raw.shortFaculty || ""
    const meta = FACULTY_EN_MAP[facultyId] || { en: `Faculty of ${facultyId}`, fac: fak }
    
    const majorMatch = raw.major.match(/^(.*?)(?:\s*\((.*?)\))?$/)
    const prodiId = majorMatch ? majorMatch[1].trim() : raw.major
    const majorEn = majorMatch && majorMatch[2] ? majorMatch[2].trim() : prodiId

    return {
        fakultas: facultyId.startsWith("Fakultas") || facultyId.startsWith("Sekolah") || facultyId.startsWith("Program")
            ? facultyId
            : `Fakultas ${facultyId}`,
        faculty: meta.en,
        fak,
        fac: meta.fac,
        departemen: facultyId,
        department: meta.en,
        dep: fak,
        prodi: prodiId,
        major: majorEn,
        studyProgram: raw.major,
        educationalProgram: raw.program,
    }
}


