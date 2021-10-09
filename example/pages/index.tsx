import cytoscape from 'cytoscape'
import type { NextPage } from 'next'
import { useCallback } from 'react'
import data from './data'
import circularMenu from '../../dist'

cytoscape.use(circularMenu)

const Home: NextPage = () => {
  const ref = useCallback(element => {
    if (element !== null) {
      const cy = cytoscape({
        container: element,
        elements: data,
        style: [{
          selector: 'node',
          css: {
            content: 'data(name)'
          }
        }, {
          selector: 'edge',
          css: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
          }
        }]
      })

      cy.circularMenu({
        selector: 'node',
        itemColor: 'black',
        fillColor: 'rgba(255, 255, 255, 0.75)',
        activeFillColor: 'rgba(68, 3, 129, 0.75)',
        openMenuEvents: ['cxttapstart'],
        selectCommandEvents: ['tap'],
        itemColor: 'black',
        itemTextShadowColor: 'transparent',
        outsideMenuCancel: 1,
        commands: [{
          content: '<i class="fas fa-cog" style="font-size: 20px"></i>',
          select: element => console.log('Configurar', element.id())
        }, {
          content: '<i class="fas fa-trash" style="font-size: 20px"></i>',
          select: element => console.log('Excluir', element.data())
        }, {
          content: '<i class="fas fa-edit" style="font-size: 20px"></i>',
          select: element => console.log('Editar', element.data()),
          disabled: true
        }]
      })

      cy.circularMenu({
        selector: 'edge',
        itemColor: 'black',
        // fillColor: 'rgba(201, 162, 162, 0.75)',
        commands: [{
          content: '<i class="fas fa-cog" style="font-size: 20px"></i>',
          select: element => console.log('Configurar', element.id())
        }, {
          content: '<i class="fas fa-trash" style="font-size: 20px"></i>',
          select: element => console.log('Excluir', element.data())
        }, {
          content: '<i class="fas fa-edit" style="font-size: 20px"></i>',
          select: element => console.log('Editar', element.data()),
          disabled: true
        }, {
          content: '<i class="fas fa-code-branch" style="font-size: 20px"></i>',
          select: element => console.log('Branch', element.data())
        }]
      })

      // cy.circularMenu({
      //   selector: 'core',
      //   commands: [{
      //     content: 'bg1',
      //     select: () => console.log('bg1')
      //   }, {
      //     content: 'bg2',
      //     select: () => console.log('bg2')
      //   }, {
      //     content: 'bg3',
      //     select: () => console.log('bg3')
      //   }, {
      //     content: 'bg4',
      //     select: () => console.log('bg4'),
      //     disabled: true
      //   }, {
      //     content: 'bg5',
      //     select: () => console.log('bg5')
      //   }]
      // })
    }
  }, [data])

  return (
    <div id='cy' ref={ref} />
  )
}

export default Home
