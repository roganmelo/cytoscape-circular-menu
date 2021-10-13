import { Core } from 'cytoscape'

import Canvas from './canvas'
import DOM from './dom'
import { Options, Queues, Event } from './types'

class Events {
  private cy
  private container
  private parent
  private canvas
  private containerSize
  private radius
  private activeCommand?: number
  private openMenuEvents
  private selectCommandEvents
  private selector
  private commands
  private itemColor
  private itemTextShadowColor
  private adaptativeNodeSpotlightRadius
  private minSpotlightRadius
  private maxSpotlightRadius
  private menuRadius
  private activePadding
  private atMouse
  private spotlightPadding
  private outsideMenuCancel
  private target?: any = undefined
  private offset = { left: 0, top: 0 }
  private ctrx: number = 0
  private ctry: number = 0
  private inGesture = false
  private grabbable = false
  private zoomEnabled = false
  private panEnabled = false
  private boxEnabled = false

  constructor (
    cy: Core,
    container: HTMLElement,
    parent: HTMLElement,
    canvas: Canvas,
    containerSize: number,
    radius: number,
    options: Options
  ) {
    this.cy = cy
    this.container = container
    this.parent = parent
    this.canvas = canvas
    this.containerSize = containerSize
    this.radius = radius
    this.openMenuEvents = options.openMenuEvents.join(' ')
    this.selectCommandEvents = options.selectCommandEvents.join(' ')
    this.selector = options.selector
    this.commands = options.commands
    this.itemColor = options.itemColor
    this.itemTextShadowColor = options.itemTextShadowColor
    this.adaptativeNodeSpotlightRadius = options.adaptativeNodeSpotlightRadius
    this.minSpotlightRadius = options.minSpotlightRadius
    this.maxSpotlightRadius = options.maxSpotlightRadius
    this.menuRadius = options.menuRadius
    this.activePadding = options.activePadding
    this.atMouse = options.atMouse
    this.spotlightPadding = options.spotlightPadding
    this.outsideMenuCancel = options.outsideMenuCancel

    this.init()
  }

  init () {
    ['mousedown', 'mousemove', 'mouseup', 'contextmenu'].forEach(eventName => {
      this.container.addEventListener(eventName, event => {
        event.preventDefault()

        return false
      })
    })

    const updatePixelRatio = () => this.canvas.updatePixelRatio(this.containerSize)

    window.addEventListener('resize', updatePixelRatio)

    this.cy
      .on('resize', updatePixelRatio)
      .on(this.openMenuEvents, this.selector, event => this.openMenu(event))
      .on('cxtdrag tapdrag', this.selector, event => this.drag(event))
      .on('tapdrag', event => this.drag(event))
      .on(this.selectCommandEvents, () => this.selectCommand())
  }

  createMenuItems (spotlightRadius: number) {
    const menuItemClass = 'cytoscape-menu-item'

    DOM.removeElements(`.${menuItemClass}`, this.parent)

    const dtheta = 2 * Math.PI / (this.commands.length)
    const halfPI = Math.PI / 2

    this.commands.reduce(({ theta1, theta2 }, command) => {
      const midtheta = (theta1 + theta2) / 2
      const rx1 = ((this.radius + spotlightRadius) / 2) * Math.cos(midtheta)
      const ry1 = ((this.radius + spotlightRadius) / 2) * Math.sin(midtheta)

      // Arbitrary multiplier to increase the sizing of the space
      // available for the item.
      const width = 1 * Math.abs((this.radius - spotlightRadius) * Math.cos(midtheta))
      const height = 1 * Math.abs((this.radius - spotlightRadius) * Math.sin(midtheta))
      const definedWidth = Math.max(width, height)
      const item = DOM.createElement(undefined, menuItemClass)

      DOM.setStyles(item, {
        color: this.itemColor,
        cursor: 'default',
        display: 'table',
        textAlign: 'center',
        // background: 'red',
        position: 'absolute',
        textShadow: `-1px -1px 2px ${this.itemTextShadowColor}, 1px -1px 2px ${this.itemTextShadowColor}, -1px 1px 2px ${this.itemTextShadowColor}, 1px 1px 1px ${this.itemTextShadowColor}`,
        left: '50%',
        top: '50%',
        minHeight: `${definedWidth}px`,
        width: `${definedWidth}px`,
        height: `${definedWidth}px`,
        marginLeft: `${rx1 - definedWidth / 2}px`,
        marginTop: `${-ry1 - definedWidth / 2}px`
      })

      const content = DOM.createElement(undefined, menuItemClass)

      if (command.content instanceof HTMLElement) {
        content.appendChild(command.content)
      } else {
        if (command.content) content.innerHTML = command.content
      }

      DOM.setStyles(content, {
        width: `${definedWidth}px`,
        height: `${definedWidth}px`,
        verticalAlign: 'middle',
        display: 'table-cell'
      })
      DOM.setStyles(content, command.contentStyle || {})

      const disabled = typeof command.disabled === 'function'
        ? command.disabled(this.target)
        : command.disabled

      if (disabled) {
        DOM.setStyles(content, { opacity: '0.333' })
        // content.setAttribute('class', 'cytoscape-menu-content cytoscape-menu-disabled')
      }

      this.parent.appendChild(item)
      item.appendChild(content)

      return {
        theta1: theta1 + dtheta,
        theta2: theta2 + dtheta
      }
    }, { theta1: halfPI, theta2: halfPI + dtheta })
  }

  openMenu (event: Event) {
    this.target = event.target

    const isCy = this.target === this.cy

    if (this.inGesture) return this.closeMenu()
    if (!this.commands || this.commands.length === 0) return

    this.zoomEnabled = this.cy.userZoomingEnabled()
    this.cy.userZoomingEnabled(false)
    this.panEnabled = this.cy.userPanningEnabled()
    this.cy.userPanningEnabled(false)
    this.boxEnabled = this.cy.boxSelectionEnabled()
    this.cy.boxSelectionEnabled(false)
    this.grabbable = this.target?.grabbable()

    if (this.grabbable) this.target?.ungrabify()

    let renderedPosition, renderedOuterWidth, spotlightRadius

    if (
      !isCy &&
      this.target &&
      this.target.isNode instanceof Function &&
      this.target.isNode() &&
      !this.target.isParent() &&
      !this.atMouse
    ) {
      // If it's a node, the default spotlight radius for a node is the node width
      renderedPosition = this.target.renderedPosition()
      renderedOuterWidth = this.target.renderedOuterWidth()
      // If adaptativeNodespotlightRadius is not enabled and min|maxSpotlighrRadius is defined, use those instead
      spotlightRadius = renderedOuterWidth / 2
      spotlightRadius = !this.adaptativeNodeSpotlightRadius && this.minSpotlightRadius
        ? Math.max(spotlightRadius, this.minSpotlightRadius)
        : spotlightRadius
      spotlightRadius = !this.adaptativeNodeSpotlightRadius && this.maxSpotlightRadius
        ? Math.min(spotlightRadius, this.maxSpotlightRadius)
        : spotlightRadius
    } else {
      // If it's the background or an edge, the spotlight radius is the min|maxSpotlightRadius
      renderedPosition = event.renderedPosition || event.cyRenderedPosition
      renderedOuterWidth = 1
      spotlightRadius = renderedOuterWidth / 2
      spotlightRadius = this.minSpotlightRadius
        ? Math.max(spotlightRadius, this.minSpotlightRadius)
        : spotlightRadius
      spotlightRadius = this.maxSpotlightRadius
        ? Math.min(spotlightRadius, this.maxSpotlightRadius)
        : spotlightRadius
    }

    this.offset = DOM.getOffset(this.container)
    this.ctrx = renderedPosition.x
    this.ctry = renderedPosition.y
    this.radius = renderedOuterWidth / 2 + this.menuRadius
    this.containerSize = (this.radius + this.activePadding) * 2
    this.canvas.updatePixelRatio(this.containerSize)

    DOM.setStyles(this.parent, {
      width: `${this.containerSize}px`,
      height: `${this.containerSize}px`,
      display: 'block',
      left: `${renderedPosition.x - this.radius}px`,
      top: `${renderedPosition.y - this.radius}px`
    })
    this.createMenuItems(spotlightRadius)
    this.canvas.addToQueue(Queues.DrawBackground, {
      radius: this.radius,
      spotlightRadius,
      containerSize: this.containerSize
    })

    this.activeCommand = undefined
    this.inGesture = true
  }

  restoreGestures () {
    if (this.grabbable) this.target?.grabify()
    if (this.zoomEnabled) this.cy.userZoomingEnabled(true)
    if (this.panEnabled) this.cy.userPanningEnabled(true)
    if (this.boxEnabled) this.cy.boxSelectionEnabled(true)
  }

  drag (event: Event) {
    if (!this.inGesture) return

    event.preventDefault() // Otherwise, on mobile, the pull-down refresh gesture gets activated

    const originalEvent = event.originalEvent
    const touches = originalEvent.touches
    const isTouch = touches && touches.length > 0
    const pageX = (isTouch ? touches[0].pageX : originalEvent.pageX) - window.pageXOffset
    const pageY = (isTouch ? touches[0].pageY : originalEvent.pageY) - window.pageYOffset

    this.activeCommand = undefined

    let dx = pageX - this.offset.left - this.ctrx
    const dy = pageY - this.offset.top - this.ctry

    if (dx === 0) dx = 0.01

    const d = Math.sqrt(dx * dx + dy * dy)
    const cosTheta = (dy * dy - d * d - dx * dx) / (-2 * d * dx)

    let theta = Math.acos(cosTheta)
    let renderedOuterWidth, spotlightRadius

    if (
      this.target &&
      this.target.isNode instanceof Function &&
      this.target.isNode() &&
      !this.target.isParent() &&
      !this.atMouse
    ) {
      // If it's a node, the default spotlight radius for a node is the node width
      renderedOuterWidth = this.target.renderedOuterWidth()
      spotlightRadius = renderedOuterWidth / 2
      // If adaptativeNodespotlightRadius is not enabled and min|maxSpotlighrRadius is defined, use those instead
      spotlightRadius = !this.adaptativeNodeSpotlightRadius && this.minSpotlightRadius
        ? Math.max(spotlightRadius, this.minSpotlightRadius)
        : spotlightRadius
      spotlightRadius = !this.adaptativeNodeSpotlightRadius && this.maxSpotlightRadius
        ? Math.min(spotlightRadius, this.maxSpotlightRadius)
        : spotlightRadius
    } else {
      // If it's the background or an edge, the spotlight radius is the min|maxSpotlightRadius
      renderedOuterWidth = 1
      spotlightRadius = renderedOuterWidth / 2
      spotlightRadius = this.minSpotlightRadius
        ? Math.max(spotlightRadius, this.minSpotlightRadius)
        : spotlightRadius
      spotlightRadius = this.maxSpotlightRadius
        ? Math.min(spotlightRadius, this.maxSpotlightRadius)
        : spotlightRadius
    }

    this.radius = renderedOuterWidth / 2 + this.menuRadius

    this.canvas.addToQueue(Queues.DrawBackground, {
      radius: this.radius,
      spotlightRadius,
      containerSize: this.containerSize
    })

    if (
      d < spotlightRadius + this.spotlightPadding ||
      (typeof this.outsideMenuCancel === 'number' &&
      d > this.radius + this.activePadding + this.outsideMenuCancel)
    ) {
      return
    }

    const rx = dx * this.radius / d
    const ry = dy * this.radius / d

    if (dy > 0) theta = Math.PI + Math.abs(theta - Math.PI)

    const dtheta = 2 * Math.PI / (this.commands.length)
    const halfPI = Math.PI / 2

    let theta1 = halfPI
    let theta2 = halfPI + dtheta

    for (let index = 0; index < this.commands.length; index++) {
      const command = this.commands[index]
      const inThisCommand = (theta1 <= theta && theta <= theta2) ||
        (theta1 <= theta + 2 * Math.PI && theta + 2 * Math.PI <= theta2)
      const disabled = typeof command.disabled === 'function'
        ? command.disabled(this.target)
        : command.disabled

      if (inThisCommand && !disabled) {
        this.activeCommand = index

        break
      }

      theta1 += dtheta
      theta2 += dtheta
    }

    // this.commands.reduce(({ theta1, theta2 }, command, index) => {
    //   const inThisCommand = theta1 <= theta && theta <= theta2
    //     || theta1 <= theta + 2 * Math.PI && theta + 2 * Math.PI <= theta2

    //   if (inThisCommand && !command.disabled) {
    //     this.activeCommand = index

    //     return { theta1, theta2 }
    //   }

    //   return {
    //     theta1: theta1 + dtheta,
    //     theta2: theta2 + dtheta
    //   }
    // }, { theta1: halfPI, theta2: halfPI + dtheta })

    this.canvas.addToQueue(Queues.DrawCommands, {
      rx,
      ry,
      radius: this.radius,
      theta,
      spotlightRadius,
      activeCommand: this.activeCommand
    })
  }

  selectCommand () {
    if (this.activeCommand !== undefined) {
      const select = this.commands[this.activeCommand].select

      if (select && this.target) {
        select.apply(this.target, [this.target])
        this.activeCommand = undefined
      }
    }

    this.closeMenu()
  }

  closeMenu () {
    this.parent.style.display = 'none'
    this.inGesture = false
    this.restoreGestures()
  }

  destroy () {
    const updatePixelRatio = () => this.canvas.updatePixelRatio(this.containerSize)

    this.cy
      .off('resize', updatePixelRatio)
      .off(this.openMenuEvents, this.selector, event => this.openMenu(event))
      .off('cxtdrag tapdrag', this.selector, event => this.drag(event))
      .off('tapdrag', event => this.drag(event))
      .off(this.selectCommandEvents, () => this.selectCommand())

    window.removeEventListener('resize', updatePixelRatio)

    this.container.remove()
  }
}

export default Events
