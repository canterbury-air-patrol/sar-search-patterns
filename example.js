import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import React from 'react'
import * as ReactDOM from 'react-dom/client'

import { SearchDisplay } from './react'
import { SectorSearch, ExpandingBoxSearch, CreepingLineAheadSearch } from './sar-search-patterns'

const search = new SectorSearch(200, 2, 45)
const ebsearch = new ExpandingBoxSearch(200, 2, 45)
const clsearch = new CreepingLineAheadSearch(200, 1000, 5, 45)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<><SearchDisplay search={search} /><SearchDisplay search={ebsearch} /><SearchDisplay search={clsearch} /></>)
