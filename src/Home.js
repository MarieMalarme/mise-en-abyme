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
  const [export_canvas, set_export_canvas] = useState(null)
  const [export_context, set_export_context] = useState(null)

  const [source_image, set_source_image] = useState()
  const [inc_index, set_inc_index] = useState(0)

  // customizable input parameters
  const [patterns_per_line, set_patterns_per_line] = useState(50)
  const [pattern_size, set_pattern_size] = useState(10)
  const [saturation, set_saturation] = useState(200)
  const [brightness, set_brightness] = useState(100)
  const [invert, set_invert] = useState(0)
  const [hue, set_hue] = useState(0)

  const canvas_width = patterns_per_line * pattern_size
  const is_oversized = canvas_width > window.innerWidth
  const canvas_filter = `saturate(${saturation}%) hue-rotate(${hue}deg) invert(${invert}%) brightness(${brightness}%)`

  const render_canvas = (inc_index) => {
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

      // shuffle the images if the user hovered the shuffling stripe
      const shuffled_images = [
        ...images.slice(inc_index, images.length),
        ...images.slice(0, inc_index),
      ]

      // match an image pattern to each pixel according to its greyscale value
      let patterns = []
      const chunk_size = 4
      for (let i = 0; i < pixels.length; i += chunk_size) {
        const [red, green, blue] = pixels.slice(i, i + chunk_size)
        const grey = Math.floor((red + green + blue) / 3)
        const index = Math.floor(grey / (255 / images_ids.length)) - 1
        const matching_pattern = shuffled_images.at(index)
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
    }
    img.src = source_image
  }

  useEffect(() => {
    if (!canvas) return
    const context = canvas.getContext('2d', { willReadFrequently: true })
    set_context(context)
  }, [canvas])

  useEffect(() => {
    if (!export_canvas) return
    const export_context = export_canvas.getContext('2d', {
      willReadFrequently: true,
    })
    set_export_context(export_context)
  }, [export_canvas])

  useEffect(() => {
    if (!context) return
    render_canvas(inc_index)
  }, [
    canvas,
    context,
    patterns_per_line,
    pattern_size,
    source_image,
    inc_index,
  ])

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
      <Canvas style={{ filter: canvas_filter }} elemRef={set_canvas} />
      <ExportCanvas hidden elemRef={set_export_canvas} />

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

      <ShufflingStripe inc_index={inc_index} set_inc_index={set_inc_index} />

      <Downloads
        canvases={{ canvas, export_canvas }}
        export_context={export_context}
        render_canvas={render_canvas}
        filter={canvas_filter}
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

const ShufflingStripe = ({ inc_index, set_inc_index }) => (
  <ShufflingWrapper>
    <ShufflingLabel>Shuffling-patterns stripe</ShufflingLabel>
    <ShufflingFrames
      style={{
        gridTemplateColumns: `repeat(${images.length}, 1fr)`,
        background: 'linear-gradient(transparent, white 85%)',
      }}
    >
      {images.map((image, index) => {
        const is_selected = inc_index === index
        return (
          <ShufflingFrame
            key={index}
            fs15={is_selected}
            grey5={!is_selected}
            onMouseOver={(event) => set_inc_index(index)}
          >
            {is_selected && <Dot />}
            <Span mb10={!is_selected} mb8={is_selected}>
              {index + 1}
            </Span>
          </ShufflingFrame>
        )
      })}
    </ShufflingFrames>
  </ShufflingWrapper>
)

const Downloads = ({ canvases, export_context, render_canvas, filter }) => {
  const { canvas, export_canvas } = canvases
  return (
    <DownloadButtons>
      <DownloadButton
        onClick={() => {
          export_canvas.width = canvas.width
          export_canvas.height = canvas.height
          export_context.filter = filter
          export_context.drawImage(canvas, 0, 0)

          const link = document.createElement('a')
          const image = export_canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream')
          link.href = image
          link.download = 'canvas.png'
          link.click()
          link.remove()
        }}
      >
        Download image
      </DownloadButton>

      <DownloadButton
        t30
        onClick={() => {
          const timer = 100
          let index = 0

          const canvas_stream = export_canvas.captureStream() // capture stream from canvas
          const recorder = new MediaRecorder(canvas_stream) // init the recorder
          const media_chunks = [] // store the recorded media chunks (blobs)

          const animate_canvas = () => {
            render_canvas(index)
            export_canvas.width = canvas.width
            export_canvas.height = canvas.height
            export_context.filter = filter
            export_context.drawImage(canvas, 0, 0)
            index++
            if (index === images.length) {
              // stop recording when all images have been displayed
              recorder.stop()
              return
            }
            setTimeout(animate_canvas, timer)
          }

          // start recording
          recorder.start()
          animate_canvas()
          // store new data made available by the recorder
          recorder.ondataavailable = ({ data }) => media_chunks.push(data)
          // once the recorder stops, make a complete blob from all the chunks
          recorder.onstop = () => {
            const blob = new Blob(media_chunks, { type: 'video/mp4' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = 'canvas-animated'
            link.click()
            link.remove()
          }
        }}
      >
        Download video
      </DownloadButton>
    </DownloadButtons>
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

// shuffling stripe
const ShufflingWrapper = Component.w100p.fixed.b0.div()
const ShufflingLabel =
  Component.pv5.ph10.bg_white.b_rad20.ba.ml30.fs14.grey6.span()
const ShufflingFrames =
  Component.mt30.c_pointer.grid.h60.w100p.text_center.div()
const ShufflingFrame =
  Component.h100p.w100p.br.fs10.flex.flex_column.ai_center.jc_flex_end.div()
const Dot = Component.mb15.h7.w7.bg_black.b_rad50p.div()

// render
const Wrapper = Component.flex.w100vw.min_h100vh.div()
const Canvas = Component.canvas()
const ExportCanvas = Component.fixed.t0.canvas()

// downloads
const DownloadButtons = Component.fixed.t30.r30.flex.flex_column.div()
const DownloadButton = Component.bg_white.ba.ph15.pv5.b_rad20.fs14.mb10.button()

export default Home
