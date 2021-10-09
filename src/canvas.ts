import DOM from './dom'
import {
  Options,
  Queues,
  DrawBackgroundArgs,
  DrawCommandsArgs,
  Queue
} from './types'

class Canvas {
  private activePadding
  private commands
  private fillColor
  private separatorWidth
  private spotlightPadding
  private indicatorSize
  private activeFillColor
  private canvas = DOM.createElement('canvas') as HTMLCanvasElement
  private canvas2d = this.canvas.getContext('2d')
  private redrawing = true
  private queue: Queue = {
    [Queues.DrawBackground]: undefined,
    [Queues.DrawCommands]: undefined
  }

  constructor (options: Options) {
    this.activePadding = options.activePadding
    this.commands = options.commands
    this.fillColor = options.fillColor
    this.separatorWidth = options.separatorWidth
    this.spotlightPadding = options.spotlightPadding
    this.indicatorSize = options.indicatorSize
    this.activeFillColor = options.activeFillColor
  }

  getCanvasInstance () {
    return this.canvas
  }

  setSize (containerSize: number) {
    this.canvas.width = containerSize
    this.canvas.height = containerSize
  }

  updatePixelRatio (containerSize: number) {
    const pixelRatio = DOM.getPixelRatio()
    const width = containerSize
    const height = containerSize

    this.canvas.width = width * pixelRatio
    this.canvas.height = height * pixelRatio

    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'

    this.canvas2d?.setTransform(1, 0, 0, 1, 0, 0)
    this.canvas2d?.scale(pixelRatio, pixelRatio)
  }

  drawBackground ({ radius, spotlightRadius, containerSize }: DrawBackgroundArgs) {
    const dtheta = 2 * Math.PI / (this.commands.length)
    const halfPI = Math.PI / 2

    this.canvas2d!.globalCompositeOperation = 'source-over'

    // draw background items
    this.canvas2d?.clearRect(0, 0, containerSize, containerSize)
    this.canvas2d!.fillStyle = this.fillColor

    let theta1 = halfPI
    let theta2 = theta1 + dtheta

    for (let index = 0; index < this.commands.length; index++) {
      const command = this.commands[index]

      if (command.fillColor) {
        this.canvas2d!.fillStyle = command.fillColor
      }

      this.canvas2d?.beginPath()
      this.canvas2d?.moveTo(radius + this.activePadding, radius + this.activePadding)
      this.canvas2d?.arc(radius + this.activePadding, radius + this.activePadding, radius, 2 * Math.PI - theta1, 2 * Math.PI - theta2, true)
      this.canvas2d?.closePath()
      this.canvas2d?.fill()

      theta1 += dtheta
      theta2 += dtheta

      this.canvas2d!.fillStyle = this.fillColor
    }

    // this.commands.reduce(({ theta1, theta2 }, command) => {
    //   if (command.fillColor) {
    //     this.canvas2d!.fillStyle = command.fillColor;
    //   }

    //   this.canvas2d?.beginPath();
    //   this.canvas2d?.moveTo(radius + this.activePadding, radius + this.activePadding);
    //   this.canvas2d?.arc(radius + this.activePadding, radius + this.activePadding, radius, 2 * Math.PI - theta1, 2 * Math.PI - theta2, true);
    //   this.canvas2d?.closePath();
    //   this.canvas2d?.fill();
    //   this.canvas2d!.fillStyle = this.fillColor;

    //   return {
    //     theta1: theta1 + dtheta,
    //     theta2: theta2 + dtheta
    //   };
    // }, { theta1: halfPI, theta2: halfPI + dtheta });

    this.canvas2d!.globalCompositeOperation = 'destination-out'

    // draw separators between items
    this.canvas2d!.strokeStyle = 'white'
    this.canvas2d!.lineWidth = this.separatorWidth

    theta1 = halfPI
    theta2 = theta1 + dtheta

    for (let index = 0; index < this.commands.length; index++) {
      const rx1 = radius * Math.cos(theta1)
      const ry1 = radius * Math.sin(theta1)

      this.canvas2d?.beginPath()
      this.canvas2d?.moveTo(radius + this.activePadding, radius + this.activePadding)
      this.canvas2d?.lineTo(radius + this.activePadding + rx1, radius + this.activePadding - ry1)
      this.canvas2d?.closePath()
      this.canvas2d?.stroke()

      theta1 += dtheta
      theta2 += dtheta
    }

    // this.commands.reduce(({ theta1, theta2 }) => {
    //   const rx1 = radius * Math.cos(theta1);
    //   const ry1 = radius * Math.sin(theta1);

    //   this.canvas2d?.beginPath();
    //   this.canvas2d?.moveTo(radius + this.activePadding, radius + this.activePadding);
    //   this.canvas2d?.lineTo(radius + this.activePadding + rx1, radius + this.activePadding - ry1);
    //   this.canvas2d?.closePath();
    //   this.canvas2d?.stroke();

    //   return {
    //     theta1: theta1 + dtheta,
    //     theta2: theta2 + dtheta
    //   };
    // }, { theta1: halfPI, theta2: halfPI + dtheta });

    this.canvas2d!.fillStyle = 'white'
    this.canvas2d!.globalCompositeOperation = 'destination-out'
    this.canvas2d?.beginPath()
    this.canvas2d?.arc(radius + this.activePadding, radius + this.activePadding, spotlightRadius + this.spotlightPadding, 0, Math.PI * 2, true)
    this.canvas2d?.closePath()
    this.canvas2d?.fill()
    this.canvas2d!.globalCompositeOperation = 'source-over'
  }

  drawCommands ({ rx, ry, radius, theta, spotlightRadius, activeCommand }: DrawCommandsArgs) {
    const dtheta = 2 * Math.PI / (this.commands.length)
    const halfPI = Math.PI / 2
    const theta1 = halfPI + (dtheta * activeCommand)
    const theta2 = (halfPI + dtheta) + (dtheta * activeCommand)
    const tx = radius + this.activePadding + rx / radius * (spotlightRadius + this.spotlightPadding - this.indicatorSize / 4)
    const ty = radius + this.activePadding + ry / radius * (spotlightRadius + this.spotlightPadding - this.indicatorSize / 4)
    const rot = Math.PI / 4 - theta

    this.canvas2d!.fillStyle = this.activeFillColor
    this.canvas2d!.strokeStyle = 'black'
    this.canvas2d!.lineWidth = 1
    this.canvas2d?.beginPath()
    this.canvas2d?.moveTo(radius + this.activePadding, radius + this.activePadding)
    this.canvas2d?.arc(radius + this.activePadding, radius + this.activePadding, radius + this.activePadding, 2 * Math.PI - theta1, 2 * Math.PI - theta2, true)
    this.canvas2d?.closePath()
    this.canvas2d?.fill()

    this.canvas2d!.fillStyle = 'white'
    this.canvas2d!.globalCompositeOperation = 'destination-out'

    this.canvas2d?.translate(tx, ty)
    this.canvas2d?.rotate(rot)

    // clear the indicator
    // The indicator size (arrow) depends on the node size as well. If the indicator size is bigger and the rendered node size + padding,
    // use the rendered node size + padding as the indicator size.
    const indicatorSize = this.indicatorSize > spotlightRadius + this.spotlightPadding
      ? spotlightRadius + this.spotlightPadding
      : this.indicatorSize

    this.canvas2d?.beginPath()
    this.canvas2d?.fillRect(-indicatorSize / 2, -indicatorSize / 2, indicatorSize, indicatorSize)
    this.canvas2d?.closePath()
    this.canvas2d?.fill()
    this.canvas2d?.rotate(-rot)
    this.canvas2d?.translate(-tx, -ty)
    // this.canvas2d.setTransform( 1, 0, 0, 1, 0, 0 );

    // clear the spotlight
    this.canvas2d?.beginPath()
    this.canvas2d?.arc(radius + this.activePadding, radius + this.activePadding, spotlightRadius + this.spotlightPadding, 0, Math.PI * 2, true)
    this.canvas2d?.closePath()
    this.canvas2d?.fill()
    this.canvas2d!.globalCompositeOperation = 'source-over'
  }

  redraw () {
    const raf = window.requestAnimationFrame || (fn => setTimeout(fn, 16))

    if (this.queue.drawBackground) this.drawBackground(this.queue.drawBackground)
    if (this.queue.drawCommands) this.drawCommands(this.queue.drawCommands)

    this.queue = {
      [Queues.DrawBackground]: undefined,
      [Queues.DrawCommands]: undefined
    }

    if (this.redrawing) raf(this.redraw.bind(this))
  }

  destroy () {
    this.redrawing = false
  }

  addToQueue (operation: Queues, args: any) {
    this.queue[operation] = args
  }
}

export default Canvas
