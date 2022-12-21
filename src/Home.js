import { Fragment, useState, useEffect } from 'react'
import { Component, Div, Span } from './flags'

const images_ids = [...Array(48).keys()].map((index) => index + 1)
const images = []

images_ids.forEach((image_id) => {
  const img = new Image()
  img.onload = () => {
    images.push(img)
  }
  img.src = `./images/image-${image_id}.jpeg`
})

export const Home = ({ is_selected }) => {
  const [canvas, set_canvas] = useState(null)
  const [context, set_context] = useState(null)
  const [source_image, set_source_image] = useState()

  // customizable input parameters
  const [patterns_per_line, set_patterns_per_line] = useState(50)
  const [pattern_size, set_pattern_size] = useState(10)
  const [saturation, set_saturation] = useState(200)
  const [brightness, set_brightness] = useState(100)
  const [invert, set_invert] = useState(0)
  const [hue, set_hue] = useState(0)

  const canvas_width = patterns_per_line * pattern_size
  const is_oversized = canvas_width > window.innerWidth

  useEffect(() => {
    if (!canvas) return
    const context = canvas.getContext('2d', { willReadFrequently: true })
    set_context(context)
  }, [canvas])

  useEffect(() => {
    if (!context) return

    const render_image = () => {
      const img = new Image()
      img.onload = () => {
        // draw the source image to get its pixels data
        const ratio = img.height / img.width
        const target_width = patterns_per_line
        const target_height = Math.floor(target_width * ratio)
        const img_dimensions = [0, 0, img.width, img.height]
        const target_dimensions = [0, 0, target_width, target_height]
        canvas.width = target_width
        canvas.height = target_height
        context.drawImage(img, ...img_dimensions, ...target_dimensions)
        const pixels = context.getImageData(...target_dimensions).data

        // match an image pattern to each pixel according to its greyscale value
        let patterns = []
        const chunk_size = 4
        for (let i = 0; i < pixels.length; i += chunk_size) {
          const [red, green, blue] = pixels.slice(i, i + chunk_size)
          const grey = Math.floor((red + green + blue) / 3)
          const index = Math.floor(grey / (255 / images_ids.length)) - 1
          const matching_pattern = images.at(index)
          patterns.push(matching_pattern)
        }

        // set canvas size to fit the render parameters
        canvas.width = pattern_size * patterns_per_line
        canvas.height = pattern_size * (patterns.length / patterns_per_line)

        // clear the source image
        context.clearRect(0, 0, canvas.width, canvas.height)

        // draw the patterned image with image pool images on the render
        // 1. per each line of the image
        for (let i = 0; i < patterns.length; i += patterns_per_line) {
          const line = patterns.slice(i, i + patterns_per_line)
          const line_index = i / patterns_per_line

          // 2. per each pattern of the line
          for (const [pattern_index, pattern] of line.entries()) {
            // find matching image from the preloaded images array
            const x = pattern_index * pattern_size
            const y = line_index * pattern_size
            const width = pattern_size
            const height = pattern_size
            context.drawImage(pattern, x, y, width, height)
          }
        }

        // add feature to download final render (apply filters and redraw before downloading)
        // context.filter = `saturate(${saturation}%) hue-rotate(${hue}deg) invert(${invert}%) brightness(${brightness}%)`
        // context.drawImage(canvas, 0, 0)
      }
      img.src = source_image
    }

    render_image()
  }, [context, patterns_per_line, pattern_size, source_image, canvas])

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
    <Wrapper ai_center={!is_oversized} jc_center={!is_oversized}>
      <Canvas
        style={{
          filter: `saturate(${saturation}%) hue-rotate(${hue}deg) invert(${invert}%) brightness(${brightness}%)`,
        }}
        elemRef={set_canvas}
      />

      <Settings
        settings={{
          patterns_per_line,
          pattern_size,
          source_image,
          saturation,
          brightness,
          invert,
          hue,
          set_patterns_per_line,
          set_pattern_size,
          set_source_image,
          set_saturation,
          set_brightness,
          set_invert,
          set_hue,
        }}
      />
    </Wrapper>
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
            max={300}
            value={settings.patterns_per_line}
            set_value={settings.set_patterns_per_line}
            label={{ text: 'Patterns p/ line' }}
          />
          <Setting
            min={1}
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
            min={25}
            max={300}
            value={settings.brightness}
            set_value={settings.set_brightness}
            label={{ text: 'Brightness', unit: '%' }}
          />
          <Setting
            min={0}
            max={100}
            value={settings.invert}
            set_value={settings.set_invert}
            label={{ text: 'Invert', unit: '%' }}
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
const Wrapper = Component.flex.w100vw.min_h100vh.div()
const Canvas = Component.canvas()

export default Home
