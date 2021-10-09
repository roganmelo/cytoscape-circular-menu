import { Core, Ext } from 'cytoscape'

import defaults from './defaults'
import DOM from './dom'
import Canvas from './canvas'
import Events from './events'
import { Options } from './types'

const init = function (this: Core, params: Partial<Options> = {}) {
  const cy = this
  const options = { ...defaults, ...params }
  const container = cy.container()
  const wrapper = DOM.createElement(undefined, 'cytoscape-menu')
  const parent = DOM.createElement()
  const canvas = new Canvas(options)
  const radius = 100
  const containerSize = (radius + options.activePadding) * 2

  container?.insertBefore(wrapper, container.firstChild)
  wrapper.appendChild(parent)
  parent.appendChild(canvas.getCanvasInstance())
  DOM.setStyles(wrapper, {
    position: 'absolute',
    zIndex: options.zIndex.toString(),
    userSelect: 'none',
    pointerEvents: 'none'
  })
  DOM.setStyles(parent, {
    display: 'none',
    width: containerSize + 'px',
    height: containerSize + 'px',
    position: 'absolute',
    zIndex: '1',
    marginLeft: `${-options.activePadding}px`,
    marginTop: `${-options.activePadding}px`,
    userSelect: 'none'
  })
  canvas.setSize(containerSize)
  canvas.updatePixelRatio(containerSize)
  canvas.redraw()

  const events = new Events(
    cy,
    wrapper,
    parent,
    canvas,
    containerSize,
    radius,
    options
  )

  return {
    destroy: () => {
      canvas.destroy()
      events.destroy()
    }
  }
}

// @ts-ignore
const circularMenu: Ext = cytoscape => cytoscape?.('core', 'circularMenu', init)

export default circularMenu
