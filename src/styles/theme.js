export const theme = {
  colors: {
    primary: '#fc72ff',
    secondary: '#ff8502', // Orange for highlights
    accent: '#ff850220', // Subtle orange with opacity
    background: {
      primary: '#141823',
      secondary: '#1a1f2e',
      module: '#212738',
      interactive: '#2a3145',
      charcoal: '#0d1117', // Darker charcoal for header and modals
      highlight: 'rgba(255, 133, 2, 0.05)', // Very subtle orange highlight
    },
    text: {
      primary: '#ffffff',
      secondary: '#9B9B9B',
      tertiary: '#6C7284',
      highlight: '#ff8502', // Orange for highlighted text
    },
    border: {
      primary: '#2b2b2b',
      secondary: '#3d3d3d',
      highlight: 'rgba(255, 133, 2, 0.3)', // Subtle orange border
    },
    success: '#27AE60',
    error: '#FF6871',
    warning: '#FFB800',
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    xlarge: '24px',
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    medium: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
    large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  },
  transitions: {
    fast: '150ms ease',
    medium: '250ms ease',
    slow: '350ms ease',
  },
  zIndex: {
    dropdown: 1000,
    modal: 2000,
    tooltip: 3000,
  },
};