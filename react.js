import React from 'react'
import PropTypes from 'prop-types'

import { Table, Form } from 'react-bootstrap'
import { SectorSearch, ExpandingBoxSearch, CreepingLineAheadSearch } from './sar-search-patterns'

class SearchDisplay extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      search: this.props.search,
      searchLeg: this.props.leg !== undefined ? this.props.leg : this.props.search.currentLeg
    }
    this.canvasRef = React.createRef()
    this.minX = 0
    this.minY = 0
    this.maxX = 0
    this.maxY = 0
  }

  updateX (x) {
    if (x < this.minX) {
      this.minX = x
    }
    if (x > this.maxX) {
      this.maxX = x
    }
  }

  updateY (y) {
    if (y < this.minY) {
      this.minY = y
    }
    if (y > this.maxY) {
      this.maxY = y
    }
  }

  determineXYRange (searchLegs) {
    this.minX = 0
    this.minY = 0
    this.maxX = 0
    this.maxY = 0
    for (const idx in searchLegs) {
      const leg = searchLegs[idx]
      this.updateX(leg.from.x)
      this.updateY(leg.from.y)
      this.updateX(leg.to.x)
      this.updateY(leg.to.y)
    }
    return [Math.abs(this.maxX - this.minX), Math.abs(this.maxY - this.minY)]
  }

  drawSearch (canvas) {
    const ctx = canvas.getContext('2d')
    const searchLegs = this.state.search.getLegs()
    const range = this.determineXYRange(searchLegs)
    const offsetX = Math.abs(this.minX) + 10
    const offsetY = Math.abs(this.maxY) + 10
    range[0] += 20
    range[1] += 20
    const scaleX = canvas.width / range[0]
    const scaleY = canvas.height / range[1]
    let scale = scaleX
    if (scaleY < scaleX) {
      scale = scaleY
    }
    ctx.scale(scale, scale)
    for (const idx in searchLegs) {
      const leg = searchLegs[idx]
      ctx.beginPath()
      ctx.lineWidth = 5
      if (this.state.search.leg === leg) {
        ctx.strokeStyle = 'orange'
      } else {
        ctx.strokeStyle = 'grey'
      }
      ctx.moveTo(offsetX + leg.from.x, offsetY - leg.from.y)
      ctx.lineTo(offsetX + leg.to.x, offsetY - leg.to.y)
      ctx.stroke()
    }
  }

  componentDidMount () {
    const canvas = this.canvasRef.current
    this.drawSearch(canvas)
  }

  render () {
    return (<canvas ref={this.canvasRef} width={600} height={600} />)
  }
}
SearchDisplay.propTypes = {
  search: PropTypes.object.isRequired,
  leg: PropTypes.number
}

function constructSearch (values) {
  if (values.searchType === 'sector') {
    return new SectorSearch(values.sweepWidth, values.multiplier, values.iterations, values.initialDirection)
  }
  if (values.searchType === 'expandingbox') {
    return new ExpandingBoxSearch(values.sweepWidth, values.iterations, values.initialDirection)
  }
  if (values.searchType === 'creepingline') {
    return new CreepingLineAheadSearch(values.sweepWidth, values.legLength, values.iterations, values.initialDirection)
  }
}

class SearchConfiguration extends React.Component {
  constructor (props) {
    super(props)
    this.handleChangeSearch = this.handleChangeSearch.bind(this)
    this.handleChangeSweepWidth = this.handleChangeSweepWidth.bind(this)
    this.handleChangeMultiplier = this.handleChangeMultiplier.bind(this)
    this.handleChangeLegLength = this.handleChangeLegLength.bind(this)
    this.handleChangeIterations = this.handleChangeIterations.bind(this)
    this.handleChangeDirection = this.handleChangeDirection.bind(this)
    this.state = {
      searchType: 'sector',
      sweepWidth: 200,
      legLength: 1000,
      iterations: 1,
      initialDirection: 0,
      multiplier: 1
    }
  }

  handleChangeSearch (event) {
    const target = event.target
    const value = target.value

    this.setState(function (oldState) {
      oldState.searchType = value

      if (this.props.updateSearch !== undefined) {
        this.props.updateSearch(constructSearch(oldState))
      }

      return {
        searchType: value
      }
    })
  }

  handleChangeSweepWidth (event) {
    const target = event.target
    const value = Number(target.value)

    this.setState(function (oldState) {
      oldState.sweepWidth = value

      if (this.props.updateSearch !== undefined) {
        this.props.updateSearch(constructSearch(oldState))
      }

      return {
        sweepWidth: value
      }
    })
  }

  handleChangeLegLength (event) {
    const target = event.target
    const value = Number(target.value)

    this.setState(function (oldState) {
      oldState.legLength = value

      if (this.props.updateSearch !== undefined) {
        this.props.updateSearch(constructSearch(oldState))
      }

      return {
        legLength: value
      }
    })
  }

  handleChangeMultiplier (event) {
    const target = event.target
    const value = Number(target.value)

    this.setState(function (oldState) {
      oldState.multiplier = value

      if (this.props.updateSearch !== undefined) {
        this.props.updateSearch(constructSearch(oldState))
      }

      return {
        multiplier: value
      }
    })
  }

  handleChangeIterations (event) {
    const target = event.target
    const value = Number(target.value)

    this.setState(function (oldState) {
      oldState.iterations = value

      if (this.props.updateSearch !== undefined) {
        this.props.updateSearch(constructSearch(oldState))
      }

      return {
        iterations: value
      }
    })
  }

  handleChangeDirection (event) {
    const target = event.target
    const value = Number(target.value)

    this.setState(function (oldState) {
      oldState.initialDirection = value

      if (this.props.updateSearch !== undefined) {
        this.props.updateSearch(constructSearch(oldState))
      }

      return {
        initialDirection: value
      }
    })
  }

  render () {
    const labels = []
    const inputs = []
    if (this.state.searchType === 'sector' || this.state.searchType === 'expandingbox') {
      labels.push((<td key='iterations'>Iterations</td>))
      inputs.push((<td key='iterations'><Form.Control type='number' onChange={this.handleChangeIterations} value={this.state.iterations} /></td>))
      if (this.state.searchType === 'sector') {
        labels.push((<td key='multiplier'>Multiplier</td>))
        inputs.push((<td key='multiplier'><Form.Control type='number' onChange={this.handleChangeMultiplier} value={this.state.multiplier} /></td>))
      }
      labels.push((<td key='direction'>Initial Direction</td>))
      inputs.push((<td key='direction'><Form.Control type='number' onChange={this.handleChangeDirection} value={this.state.initialDirection} /></td>))
    } else if (this.state.searchType === 'creepingline') {
      labels.push((<td key='legs'>Leg Length</td>))
      labels.push((<td key='iterations'>Legs</td>))
      labels.push((<td key='direction'>Progress Direction</td>))
      inputs.push((<td key='legs'><Form.Control type='number' onChange={this.handleChangeLegLength} value={this.state.legLength} /></td>))
      inputs.push((<td key='iterations'><Form.Control type='number' onChange={this.handleChangeIterations} value={this.state.iterations} /></td>))
      inputs.push((<td key='direction'><Form.Control type='number' onChange={this.handleChangeDirection} value={this.state.initialDirection} /></td>))
    }
    return (
      <>
        <Table>
          <thead>
            <tr>
              <td>Search Type</td>
              <td>Sweep Width</td>
              {labels}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Form.Select onChange={this.handleChangeSearch}>
                  <option value='sector'>Sector</option>
                  <option value='expandingbox'>Expanding Box</option>
                  <option value='creepingline'>Creeping Line</option>
                </Form.Select>
              </td>
              <td><Form.Control type='number' onChange={this.handleChangeSweepWidth} value={this.state.sweepWidth} /></td>
              {inputs}
            </tr>
          </tbody>
        </Table>
      </>
    )
  }
}
SearchConfiguration.propTypes = {
  updateSearch: PropTypes.func
}

export { SearchDisplay, SearchConfiguration }
