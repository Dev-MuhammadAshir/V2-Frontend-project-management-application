/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#0891B2',
        'neutral-bg': '#F9FAFB',
        'neutral-card': '#F3F4F6',
        'neutral-border': '#E5E7EB',
        'neutral-text': '#111827',
        'neutral-muted': '#6B7280',
        'kanban-todo': '#94A3B8',
        'kanban-progress': '#3B82F6',
        'kanban-done': '#22C55E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        full: '9999px',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        12: '48px',
      },
    },
  },
  plugins: [],
};
