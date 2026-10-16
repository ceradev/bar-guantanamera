import { Bowlby_One, Inter, League_Spartan } from "next/font/google"

export const leagueSpartan = League_Spartan({
    subsets: ["latin"],
    variable: "--font-league-spartan",
    weight: ["400", "500", "600", "700", "800", "900"],
})

export const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    weight: ["400", "500", "600", "700"],
})

export const bowlbyOne = Bowlby_One({
    subsets: ["latin"],
    variable: "--font-bowlby-one",
    weight: "400",
})
