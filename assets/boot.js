import p0 from './p0.js'
import p1 from './p1.js'
import p2 from './p2.js'
import p3 from './p3.js'
import p4 from './p4.js'
import p5 from './p5.js'
import p6 from './p6.js'
import p7 from './p7.js'
import p8 from './p8.js'
import p9 from './p9.js'
import p10 from './p10.js'
import p11 from './p11.js'
const code = p0+p1+p2+p3+p4+p5+p6+p7+p8+p9+p10+p11
const blob = new Blob([code], { type: 'text/javascript' })
import(URL.createObjectURL(blob))
