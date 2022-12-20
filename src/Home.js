import { Fragment, useState, useEffect } from 'react'
import { Component, Div, Span } from './flags'
import source_image_file from './image.jpeg'

const patterns_ids = [...Array(48).keys()].map((index) => index + 1)

export const Home = ({ is_selected }) => {
  const [canvas, set_canvas] = useState(null)
  const [context, set_context] = useState(null)
  const [source_image, set_source_image] = useState()
  const [patterns_lines, set_patterns_lines] = useState([])

  // customizable input parameters
  const [patterns_per_line, set_patterns_per_line] = useState(50)
  const [pattern_size, set_pattern_size] = useState(10)
  const [saturation, set_saturation] = useState(200)
  const [hue, set_hue] = useState(0)

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

  // when the user arrives on the app, no image is loaded yet:
  // a file input is displayed to updload one
  if (!source_image) {
    return (
      <UploadLabel>
        <UploadLabelButton fs30 b_rad100 pv20 ph40 bw2>
          Hello hello! To get started, click & import an image...
        </UploadLabelButton>
        <UploadInput
          type="file"
          onChange={(event) => {
            const reader = new FileReader()
            reader.onload = (event) => set_source_image(event.target.result)
            reader.readAsDataURL(event.target.files[0])
          }}
        />
      </UploadLabel>
    )
  }

  return (
    <Fragment>
      <Canvas none elemRef={set_canvas} width="0" height="0" />

      <Settings
        settings={{
          patterns_per_line,
          pattern_size,
          source_image,
          saturation,
          hue,
          set_patterns_per_line,
          set_pattern_size,
          set_source_image,
          set_saturation,
          set_hue,
        }}
      />

      <Render
        patterns_lines={patterns_lines}
        settings={{ patterns_per_line, pattern_size, saturation, hue }}
      />
    </Fragment>
  )
}

const Render = ({ patterns_lines, settings }) => {
  const { patterns_per_line, pattern_size, saturation, hue } = settings
  const canvas_width = patterns_per_line * pattern_size
  const is_oversized = canvas_width > window.innerWidth
  const image_filter = `saturate(${saturation}%) hue-rotate(${hue}deg)`
  const size = pattern_size

  return (
    <PatternsWrapper ai_center={!is_oversized} jc_center={!is_oversized}>
      <PatternsImage style={{ filter: image_filter }}>
        {patterns_lines.map((patterns_line, index) => (
          <PatternsLine key={index}>
            {patterns_line.map((pattern_id, index) => {
              const background = `center / cover url('./images/image-${pattern_id}.jpeg')`
              const brightness = (pattern_id / patterns_ids.length) * 150 + 20
              const filter = `brightness(${brightness}%)`
              const style = { width: size, height: size, filter, background }
              return <Pattern key={index} style={style} />
            })}
          </PatternsLine>
        ))}
      </PatternsImage>
    </PatternsWrapper>
  )
}

const Settings = ({ settings }) => {
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
            min={10}
            max={200}
            value={settings.patterns_per_line}
            set_value={settings.set_patterns_per_line}
            label={{ text: 'Patterns p/ line' }}
          />
          <Setting
            min={3}
            max={75}
            value={settings.pattern_size}
            set_value={settings.set_pattern_size}
            label={{ text: 'Pattern size', unit: 'px' }}
          />
          <Setting
            min={0}
            max={2000}
            value={settings.saturation}
            set_value={settings.set_saturation}
            label={{ text: 'Saturation', unit: '%' }}
          />
          <Setting
            min={0}
            max={360}
            value={settings.hue}
            set_value={settings.set_hue}
            label={{ text: 'Hue', unit: '°' }}
          />

          <ImageUpload>
            <SourceImage src={settings.source_image}></SourceImage>
            <UploadLabel>
              <UploadLabelButton>Try with another image!</UploadLabelButton>
              <UploadInput
                type="file"
                onChange={({ target }) => {
                  const reader = new FileReader()
                  reader.onload = ({ target }) => {
                    settings.set_source_image(target.result)
                  }
                  reader.readAsDataURL(target.files[0])
                }}
              />
            </UploadLabel>
          </ImageUpload>
        </Fragment>
      )}
    </Controls>
  )
}

const Setting = ({ value, set_value, label, ...props }) => {
  return (
    <Parameter>
      <RangeInput
        type="range"
        defaultValue={value}
        onInput={({ target }) => set_value(Number(target.value))}
        {...props}
      />
      <Span grey5 mr5>
        {label.text}:
      </Span>
      <Span mr2>{value}</Span>
      {label.unit}
    </Parameter>
  )
}

const Canvas = Component.canvas()

// control panel
const Controls =
  Component.fixed.flex.flex_column.ai_flex_start.zi10.t30.l30.bg_white.pa20.ba.b_rad10.div()
const Header =
  Component.c_pointer.fs13.uppercase.ls3.grey5.flex.jc_between.w100p.div()
const Parameter = Component.w100p.fs14.mt10.flex.ai_center.div()
const RangeInput = Component.w105.mr15.input()
const UploadLabel =
  Component.black.fs15.w100p.h100p.absolute.flex.ai_center.jc_center.label()
const UploadLabelButton =
  Component.ba.b_rad20.b_black.bg_white.bw1.ph25.pv5.span()
const ImageUpload = Component.w100p.mt30.relative.flex.ai_center.jc_center.div()
const UploadInput = Component.o0.w100p.h100p.absolute.c_pointer.input()
const SourceImage = Component.w100p.min_h100.ba.b_black.img()

// render
const PatternsWrapper = Component.flex.w100vw.min_h100vh.div()
const PatternsImage = Component.fs8.mono.ws_nowrap.div()
const PatternsLine = Component.flex.ai_center.div()
const Pattern =
  Component.w10.h10.flex_shrink0.flex.ai_center.jc_center.text_center.span()

export default Home
