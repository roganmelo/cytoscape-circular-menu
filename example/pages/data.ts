import type { ElementDefinition } from 'cytoscape'

const data: ElementDefinition[] = [{
  data: {
    id: 'step1',
    name: 'step1'
  }
}, {
  data: {
    id: 'step2',
    name: 'step2'
  }
}, {
  data: {
    id: 'step3',
    name: 'step3'
  }
}, {
  data: {
    id: 'step4',
    name: 'step4'
  }
}, {
  data: {
    source: 'step1',
    target: 'step2'
  }
}, {
  data: {
    source: 'step2',
    target: 'step3'
  }
}, {
  data: {
    source: 'step3',
    target: 'step4'
  }
},
// {
//   data: {
//     source: 'e',
//     target: 'j'
//   }
// }, {
//   data: {
//     source: 'e',
//     target: 'k'
//   }
// }, {
//   data: {
//     source: 'k',
//     target: 'j'
//   }
// }, {
//   data: {
//     source: 'k',
//     target: 'e'
//   }
// }, {
//   data: {
//     source: 'k',
//     target: 'g'
//   }
// }, {
//   data: {
//     source: 'g',
//     target: 'j'
//   }
// }
]

export default data
