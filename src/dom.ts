const DOM = {
  removeElements: (query: string, ancestor: HTMLElement | Document = document) => {
    const elements = ancestor.querySelectorAll(query)

    elements.forEach(element => element?.parentNode?.removeChild(element))
  },
  setStyles: (element: HTMLElement, style: Partial<CSSStyleDeclaration>) => {
    Object.assign(element.style, style)
  },
  createElement: (tag = 'div', className = '', style?: Partial<CSSStyleDeclaration>) => {
    const element = document.createElement(tag)

    element.className = className

    if (style) DOM.setStyles(element, style)

    return element
  },
  getPixelRatio: () => window.devicePixelRatio || 1,
  getOffset: (element: HTMLElement) => {
    const offset = element.getBoundingClientRect()
    const computedStyle = getComputedStyle(document.body)
    const paddingLeft = parseFloat(computedStyle.paddingLeft)
    const borderLeftWidth = parseFloat(computedStyle.borderLeftWidth)
    const paddingTop = parseFloat(computedStyle.paddingTop)
    const borderTopWidth = parseFloat(computedStyle.borderTopWidth)

    return {
      left: offset.left + document.body.scrollLeft + paddingLeft + borderLeftWidth,
      top: offset.top + document.body.scrollTop + paddingTop + borderTopWidth
    }
  }
}

export default DOM
