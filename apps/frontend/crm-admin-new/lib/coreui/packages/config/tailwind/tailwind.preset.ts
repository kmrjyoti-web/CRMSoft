import type { Config } from "tailwindcss";

const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-active": "var(--color-primary-active)",
        secondary: "var(--color-secondary)",
        "secondary-hover": "var(--color-secondary-hover)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        success: "var(--color-success)",
        "success-hover": "var(--color-success-hover)",
        warning: "var(--color-warning)",
        "warning-hover": "var(--color-warning-hover)",
        danger: "var(--color-danger)",
        "danger-hover": "var(--color-danger-hover)",
        bg: {
          DEFAULT: "var(--color-bg)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
          elevated: "var(--color-bg-elevated)",
          overlay: "var(--color-bg-overlay)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
          link: "var(--color-text-link)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          hover: "var(--color-border-hover)",
          focus: "var(--color-border-focus)",
        },
      },
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
        mono: "var(--font-mono)",
        heading: "var(--font-heading)",
      },
      spacing: {
        "token-xs": "var(--spacing-xs)",
        "token-sm": "var(--spacing-sm)",
        "token-md": "var(--spacing-md)",
        "token-lg": "var(--spacing-lg)",
        "token-xl": "var(--spacing-xl)",
        "token-2xl": "var(--spacing-2xl)",
        "token-3xl": "var(--spacing-3xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
    },
  },
  plugins: [],
};

export default preset;
