import { Selector, SingularData, EventObject } from 'cytoscape'

export enum Queues {
  DrawBackground = 'drawBackground',
  DrawCommands = 'drawCommands'
}

export type DrawBackgroundArgs = {
  radius: number,
  spotlightRadius: number,
  containerSize: number
}

export type DrawCommandsArgs = {
  rx: number,
  ry: number,
  radius: number,
  theta: number,
  spotlightRadius: number,
  activeCommand: number
}

export type Queue = {
  [Queues.DrawBackground]?: DrawBackgroundArgs,
  [Queues.DrawCommands]?: DrawCommandsArgs
}

export type Command = {
  /*
  * Custom background color in menu's command list.
  * Can be any valid [CSS color definition](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
  */
  fillColor: string,
  /*
  * HTML or text content to be displayed as the command's label in the menu's command list.
  */
  content: HTMLElement | string,
  /*
  * Additional CSS properties to apply to the command content.
  */
  contentStyle: Partial<CSSStyleDeclaration>,
  /*
  * A function to execute when the command is selected.
  */
  select: ((element: SingularData) => void),
  /*
  * Whether or not the command is selectable.
  *
  * Default: false
  */
  disabled: boolean | ((element: SingularData) => boolean)
}

export type Options = {
  /*
  * The outer radius (element center to the end of the menu) in pixels.
  * It is added to the rendered size of the element.
  *
  * Default: 100
  */
  menuRadius: number,
  /*
  * Elements to which the cxtmenu instance will be applied
  */
  selector: Selector,
  /*
  * Array of commands to be displayed in the menu.
  * Alternatively, a function that returns an array of commands
  * depending on the selected element.
  */
  commands: Partial<Command>[],
  /*
  * The background color of the menu.
  * Can be any valid [CSS color definition](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
  */
  fillColor: string,
  /*
  * The color used to indicate the selected command.
  * Can be any valid [CSS color definition](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
  */
  activeFillColor: string,
  /*
  * Additional size in pixels for the active command.
  * Default: 20
  */
  activePadding: number,
  /*
  * The size in pixels of the pointer to the active command, will default to the node size if the node size is smaller than the indicator size.
  *
  * Default: 24
  */
  indicatorSize: number,
  /*
  * The empty spacing in pixels between successive commands.
  *
  * Default: 3
  */
  separatorWidth: number,
  /*
  * Extra spacing in pixels between the element and the spotlight.
  *
  * Default: 4
  */
  spotlightPadding: number,
  /*
  * Specify whether the spotlight radius should adapt to the node size.
  *
  * Default: false
  */
  adaptativeNodeSpotlightRadius: boolean,
  /*
  * The minimum radius in pixels of the spotlight (ignored for the node if {@link adaptativeNodeSpotlightRadius} is enabled but still used for the edge & background).
  *
  * Default: 24
  */
  minSpotlightRadius: number,
  /*
  * The maximum radius in pixels of the spotlight (ignored for the node if {@link adaptativeNodeSpotlightRadius} is enabled but still used for the edge & background).
  *
  * Default: 38
  */
  maxSpotlightRadius: number,
  /*
  * Events that will open the menu.
  *
  * Default: ['cxttapstart', 'taphold']
  */
  openMenuEvents: string[],
  /*
  * Events that will select command.
  *
  * Default: ['cxttapend', 'tapend']
  */
  selectCommandEvents: string[],
  /*
  * The color of text in the command's content.
  * Can be any valid [CSS color definition](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
  *
  * Default: white
  */
  itemColor: string,
  /*
  * The text shadow color of the command's content.
  * Can be any valid [CSS color definition](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
  *
  * Default: transparent
  */
  itemTextShadowColor: string,
  /*
  * The z-index of the UI div.
  *
  * Default: 9999
  */
  zIndex: number,
  /*
  * Whether or not to draw the menu at mouse position.
  *
  * Default: false
  */
  atMouse: boolean,
  /*
  * If set to true, this will cancel the command if the pointer is released outside of the spotlight, padded by the number given.
  *
  * Default: false
  */
  outsideMenuCancel: false | number
}

export type Touch = {
  pageX: number
  pageY: number
}

export type Event = EventObject & {
  originalEvent: MouseEvent & {
    touches?: Touch[]
  }
  cyRenderedPosition?: {
    x: number
    y: number
  }
}

export type MenuInstance = {
  /*
  * Clean up by manually destroying the menu instance.
  */
  destroy: () => void
}

declare global {
  namespace cytoscape {
    interface Core {
      /*
      * Set up the context menu according to the given options.
      */
      circularMenu: (options?: Options) => MenuInstance
    }
  }
}
