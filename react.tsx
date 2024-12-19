import React from 'react'

import { Table, Form } from 'react-bootstrap'
import { SearchPattern, SearchLeg, SectorSearch, ExpandingBoxSearch, CreepingLineAheadSearch } from './sar-search-patterns'

interface SearchDisplayProps {
  search: SearchPattern
  leg?: number
}

interface SearchDisplayState {
  search: SearchPattern
}

class SearchDisplay extends React.Component<SearchDisplayProps, SearchDisplayState> {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  minX: number
  minY: number
  maxX: number
  maxY: number

  constructor(props: SearchDisplayProps) {
    super(props)
    this.state = {
      search: this.props.search
    }
    this.canvasRef = React.createRef<HTMLCanvasElement>()
    this.minX = 0
    this.minY = 0
    this.maxX = 0
    this.maxY = 0
  }

  updateX(x: number) {
    if (x < this.minX) {
      this.minX = x
    }
    if (x > this.maxX) {
      this.maxX = x
    }
  }

  updateY(y: number) {
    if (y < this.minY) {
      this.minY = y
    }
    if (y > this.maxY) {
      this.maxY = y
    }
  }

  determineXYRange(searchLegs: SearchLeg[]) {
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

  drawSearch(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
      return
    }
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

  componentDidMount() {
    const canvas = this.canvasRef.current
    if (canvas !== null) {
      this.drawSearch(canvas)
    }
  }

  render() {
    return <canvas ref={this.canvasRef} width={600} height={600} />
  }
}

function constructSearch(values: SearchConfigurationState) {
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

interface SearchConfigurationProps {
  updateSearch: (search?: SearchPattern) => void
}

interface SearchConfigurationState {
  searchType: string
  sweepWidth: number
  legLength: number
  iterations: number
  initialDirection: number
  multiplier: number
}

class SearchConfiguration extends React.Component<SearchConfigurationProps, SearchConfigurationState> {
  constructor(props: SearchConfigurationProps) {
    super(props)
    this.handleStateUpdate = this.handleStateUpdate.bind(this)
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

  handleStateUpdate() {
    if (this.props.updateSearch !== undefined) {
      this.props.updateSearch(constructSearch(this.state))
    }
  }

  handleChangeSearch(event: React.ChangeEvent<HTMLSelectElement>) {
    const target = event.target
    const value = target.value

    this.setState({ searchType: value }, this.handleStateUpdate)
  }

  handleChangeSweepWidth(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = Number(target.value)

    this.setState({ sweepWidth: value }, this.handleStateUpdate)
  }

  handleChangeLegLength(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = Number(target.value)

    this.setState({ legLength: value }, this.handleStateUpdate)
  }

  handleChangeMultiplier(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = Number(target.value)

    this.setState({ multiplier: value }, this.handleStateUpdate)
  }

  handleChangeIterations(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = Number(target.value)

    this.setState({ iterations: value }, this.handleStateUpdate)
  }

  handleChangeDirection(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target
    const value = Number(target.value)

    this.setState({ initialDirection: value }, this.handleStateUpdate)
  }

  render() {
    const labels = []
    const inputs = []
    if (this.state.searchType === 'sector' || this.state.searchType === 'expandingbox') {
      labels.push(<td key="iterations">Iterations</td>)
      inputs.push(
        <td key="iterations">
          <Form.Control type="number" onChange={this.handleChangeIterations} value={this.state.iterations} />
        </td>
      )
      if (this.state.searchType === 'sector') {
        labels.push(<td key="multiplier">Multiplier</td>)
        inputs.push(
          <td key="multiplier">
            <Form.Control type="number" onChange={this.handleChangeMultiplier} value={this.state.multiplier} />
          </td>
        )
      }
      labels.push(<td key="direction">Initial Direction</td>)
      inputs.push(
        <td key="direction">
          <Form.Control type="number" onChange={this.handleChangeDirection} value={this.state.initialDirection} />
        </td>
      )
    } else if (this.state.searchType === 'creepingline') {
      labels.push(<td key="legs">Leg Length</td>)
      labels.push(<td key="iterations">Legs</td>)
      labels.push(<td key="direction">Progress Direction</td>)
      inputs.push(
        <td key="legs">
          <Form.Control type="number" onChange={this.handleChangeLegLength} value={this.state.legLength} />
        </td>
      )
      inputs.push(
        <td key="iterations">
          <Form.Control type="number" onChange={this.handleChangeIterations} value={this.state.iterations} />
        </td>
      )
      inputs.push(
        <td key="direction">
          <Form.Control type="number" onChange={this.handleChangeDirection} value={this.state.initialDirection} />
        </td>
      )
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
                  <option value="sector">Sector</option>
                  <option value="expandingbox">Expanding Box</option>
                  <option value="creepingline">Creeping Line</option>
                </Form.Select>
              </td>
              <td>
                <Form.Control type="number" onChange={this.handleChangeSweepWidth} value={this.state.sweepWidth} />
              </td>
              {inputs}
            </tr>
          </tbody>
        </Table>
      </>
    )
  }
}

export { SearchDisplay, SearchConfiguration }
