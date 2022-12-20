import { Fragment, useState, useEffect } from 'react'
import { Component, Div } from './flags'
import source_image_file from './image.jpeg'

const patterns_ids = [...Array(48).keys()].map((index) => index + 1)

export const Home = ({ is_selected }) => {
  const [canvas, set_canvas] = useState(null)
  const [context, set_context] = useState(null)
  const [source_image, set_source_image] = useState(source_image_file)
  const [patterns_lines, set_patterns_lines] = useState([])

  // customizable input parameters
  const [patterns_per_line, set_patterns_per_line] = useState(50)
  const [pattern_size, set_pattern_size] = useState(10)

  useEffect(() => {
    if (!canvas) return
    const context = canvas.getContext('2d', { willReadFrequently: true })
    set_context(context)
  }, [canvas])

  useEffect(() => {
    if (!context) return

    const load_image = () => {
      const img = new Image()
      img.onload = () => {
        const ratio = img.height / img.width
        const target_width = patterns_per_line
        const target_height = Math.floor(target_width * ratio)
        const img_dimensions = [0, 0, img.width, img.height]
        const target_dimensions = [0, 0, target_width, target_height]

        canvas.width = target_width
        canvas.height = target_height

        context.drawImage(img, ...img_dimensions, ...target_dimensions)
        const pixels = context.getImageData(...target_dimensions).data

        let patterns = []
        const chunk_size = 4
        for (let i = 0; i < pixels.length; i += chunk_size) {
          const [red, green, blue] = pixels.slice(i, i + chunk_size)
          const grey = Math.floor((red + green + blue) / 3)
          const index = Math.floor(grey / (255 / patterns_ids.length))
          const matching_pattern = patterns_ids.at(index)
          patterns.push(matching_pattern)
        }

        let lines = []
        for (let i = 0; i < patterns.length; i += patterns_per_line) {
          lines.push(patterns.slice(i, i + patterns_per_line))
        }

        set_patterns_lines(lines)

        // draw pattern image on canvas rather than on html

        // add feature to download final render
      }
      img.src = source_image
    }

    load_image(source_image_file)
  }, [context, patterns_per_line, source_image, canvas])

  const canvas_width = patterns_per_line * pattern_size
  const is_oversized = canvas_width > window.innerWidth

  return (
    <Fragment>
      <Canvas none elemRef={set_canvas} width="0" height="0" />

      <Settings
        patterns_per_line={patterns_per_line}
        set_patterns_per_line={set_patterns_per_line}
        pattern_size={pattern_size}
        set_pattern_size={set_pattern_size}
        source_image={source_image}
        set_source_image={set_source_image}
      />

      <Render ai_center={!is_oversized} jc_center={!is_oversized}>
        <PatternsImage style={{ lineHeight: '7px', filter: 'saturate(200%)' }}>
          {patterns_lines.map((line, index) => (
            <PatternsLine key={index}>
              {line.map((pattern, index) => (
                <Pattern
                  key={index}
                  style={{
                    width: `${pattern_size}px`,
                    height: `${pattern_size}px`,
                    filter: `brightness(${
                      (pattern / patterns_ids.length) * 150 + 20
                    }%)`,
                    background: `center / cover url('./images/image-${pattern}.jpeg')`,
                  }}
                />
              ))}
            </PatternsLine>
          ))}
        </PatternsImage>
      </Render>
    </Fragment>
  )
}

const Settings = ({
  patterns_per_line,
  set_patterns_per_line,
  pattern_size,
  set_pattern_size,
  source_image,
  set_source_image,
}) => {
  const [is_open, set_is_open] = useState(true)

  return (
    <Controls w250={is_open}>
      <Header onClick={() => set_is_open(!is_open)} mb15={is_open}>
        <div>Settings</div>
        <Div ml25>{is_open ? '↑' : '↓'}</Div>
      </Header>

      {is_open && (
        <Fragment>
          <Setting
            label="Patterns per line"
            value={patterns_per_line}
            set_value={(value) =>
              value < 300 && set_patterns_per_line(Number(value))
            }
          />
          <Setting
            label="Pattern size in px"
            value={pattern_size}
            set_value={(value) =>
              value < 100 && set_pattern_size(Number(value))
            }
          />

          {/* add filters / blend modes */}

          <SourceImage>
            <UploadedImage src={source_image}></UploadedImage>
            <Label>
              <LabelText>Import image</LabelText>
              <UploadInput
                type="file"
                onChange={(event) => {
                  const reader = new FileReader()
                  reader.onload = (event) =>
                    set_source_image(event.target.result)
                  reader.readAsDataURL(event.target.files[0])
                }}
              />
            </Label>
          </SourceImage>
        </Fragment>
      )}
    </Controls>
  )
}

const Setting = ({ value, set_value, label }) => {
  const [input_value, set_input_value] = useState(value)
  const has_typed = value.toString() !== input_value.toString()

  const save_on_enter = ({ key }) => key === 'Enter' && set_value(input_value)
  const save_on_click = () => has_typed && set_value(input_value)
  const handle_change = ({ target }) => set_input_value(target.value)

  return (
    <Parameter onKeyDown={save_on_enter}>
      <Div flex ai_center>
        <Input type="number" defaultValue={value} onInput={handle_change} />
        <Button o50={!has_typed} c_pointer={has_typed} onClick={save_on_click}>
          OK
        </Button>
        {label}
      </Div>
    </Parameter>
  )
}

const Render = Component.flex.w100vw.min_h100vh.div()
const Canvas = Component.canvas()
const Button =
  Component.ml5.mr10.ls1.hover_shadow.b_rad10.h20.bg_white.ba.fs11.ph10.mono.button()

// control panel
const Controls =
  Component.fixed.flex.flex_column.ai_flex_start.zi10.t30.l30.bg_white.pa20.ba.b_rad10.div()
const Header =
  Component.c_pointer.fs13.uppercase.ls3.grey5.flex.jc_between.w100p.div()
const Parameter = Component.w100p.fs14.mt10.flex.ai_center.jc_between.div()
const Input = Component.pa0.b_rad20.ba.h20.w65.text_center.input()
const Label =
  Component.blend_difference.white.fs25.w100p.h100p.absolute.flex.ai_center.jc_center.label()
const LabelText = Component.ba.b_rad20.b_white.bw2.ph25.pv5.span()
const SourceImage = Component.mt30.relative.flex.ai_center.jc_center.div()
const UploadedImage = Component.w100p.img()
const UploadInput = Component.o0.w100p.h100p.absolute.c_pointer.input()

// render
const PatternsImage = Component.fs8.mono.ws_nowrap.div()
const PatternsLine = Component.flex.ai_center.div()
const Pattern =
  Component.w10.h10.flex_shrink0.flex.ai_center.jc_center.text_center.span()

export default Home
