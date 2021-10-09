import { Options } from './types'

const defaults: Options = {
  menuRadius: 100,
  selector: 'node',
  commands: [],
  fillColor: 'rgba(255, 255, 255, 0.75)',
  activeFillColor: 'rgba(68, 3, 129, 0.75)',
  activePadding: 20,
  indicatorSize: 24,
  separatorWidth: 3,
  spotlightPadding: 4,
  adaptativeNodeSpotlightRadius: false,
  minSpotlightRadius: 24,
  maxSpotlightRadius: 38,
  openMenuEvents: ['cxttapstart'],
  selectCommandEvents: ['tap'],
  itemColor: 'black',
  itemTextShadowColor: 'transparent',
  zIndex: 9999,
  atMouse: false,
  outsideMenuCancel: 1
}

export default defaults
