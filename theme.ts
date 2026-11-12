import { createTheme } from '@mantine/core';

export const theme = createTheme({
  defaultRadius: 0,
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',
  headings: {
    fontFamily: 'Newsreader, Georgia, serif',
  },
  components: {
    Button: {
      styles: {
        root: {
          border: '2px solid #1C1C19',
          boxShadow: '4px 4px 0px 0px #1C1C19',
        },
      },
    },
    Card: {
      styles: {
        root: {
          border: '2px solid #1C1C19',
          boxShadow: '4px 4px 0px 0px #1C1C19',
        },
      },
    },
    Input: {
      styles: {
        input: {
          border: '2px solid #1C1C19',
          boxShadow: '4px 4px 0px 0px #1C1C19',
        },
      },
    },
  },
});

