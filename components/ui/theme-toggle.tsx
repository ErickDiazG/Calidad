"use client"

/**
 * @fileoverview Theme toggle component with animated Sun/Moon icons.
 * Uses next-themes for theme state management.
 * @module components/ui/theme-toggle
 */

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

/**
 * ThemeToggle component that switches between light and dark modes.
 * Renders a Sun icon in dark mode and Moon icon in light mode.
 * Includes smooth rotation animation on theme change.
 * 
 * @returns {JSX.Element} A button that toggles the theme
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch by only rendering after mount
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 shrink-0 border-border bg-card hover:bg-accent transition-colors duration-200"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
