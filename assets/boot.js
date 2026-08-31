import p0 from './p0.js'
import p1 from './p1.js'
import p2 from './p2.js'
import p3 from './p3.js'
import p4 from './p4.js'
const code = p0+p1+p2+p3+p4
const blob = new Blob([code], { type: 'text/javascript' })
import(URL.createObjectURL(blob))
