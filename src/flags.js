import { atomizify, flagify } from 'atomizify'

atomizify({
  custom_classes: {
    b_rad100: 'border-radius: 100px',
    mr2: 'margin-right: 2px',
    mb8: 'margin-bottom: 8.5px',
    w7: 'width: 7px',
    h7: 'height: 7px',
  },
})
export const { Component, Div, Span } = flagify()
