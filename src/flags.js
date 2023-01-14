import { atomizify, flagify } from 'atomizify'

atomizify({
  custom_classes: {
    b_rad100: 'border-radius: 100px',
    mr2: 'margin-right: 2px',
    mb8: 'margin-bottom: 8.5px',
    mt_1: 'margin-top: -1px',
    w2: 'width: 3px',
    h2: 'height: 3px',
    w7: 'width: 7px',
    h7: 'height: 7px',
    bg_black_gradient:
      'background: linear-gradient(transparent, rgb(100, 100, 100))',
  },

  media_queries: {
    __xs: {
      query: 'max-width: 600px',
      description: 'small screens',
    },
  },
})
export const { Component, Div, Span } = flagify()
