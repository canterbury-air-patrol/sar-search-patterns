import React from 'react'
import PropTypes from 'prop-types'

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

export { SearchDisplay }
