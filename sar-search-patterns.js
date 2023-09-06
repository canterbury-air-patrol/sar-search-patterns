class SearchLeg {
  constructor (from, to, distance, bearing) {
    this.from = from
    this.to = to
    this.bearing = bearing
    this.distance = distance
  }
}

class SearchPattern {
  constructor (sweepWidth) {
    this.sweepWidth = Number(sweepWidth)
    this.searchLegs = []
    this.currentLeg = 1
  }

  get leg () {
    return this.searchLegs[this.currentLeg - 1]
  }

  get complete () {
    return (this.currentLeg > this.searchLegs.length)
  }

  get length () {
    let length = 0
    for (const legIdx in this.searchLegs) {
      const tmpLeg = this.searchLegs[legIdx]
      length += tmpLeg.distance
    }
    return length
  }

  getLegs () {
    return this.searchLegs
  }

  nextLeg () {
    this.currentLeg++
  }
}

function move (from, direction, distance) {
  const to = { x: 0, y: 0 }
  const rads = direction * Math.PI / 180
  to.x = from.x + (Math.sin(rads) * distance)
  to.y = from.y + (Math.cos(rads) * distance)
  return to
}

class SectorSearch extends SearchPattern {
  constructor (sweepWidth, multiplier, iterations, startingDirection) {
    super(sweepWidth)
    this.searchType = 'sector'
    this.startingDirection = Number(startingDirection)
    if (this.startingDirection === undefined) {
      this.startingDirection = 0
    }
    this.multiplier = multiplier
    if (this.multiplier <= 0) {
      this.multiplier = 1
    }
    if (this.multiplier > 3) {
      this.multiplier = 3
    }
    this.iterations = iterations
    if (!(this.iterations === 1 || this.iterations === 2 || this.iterations === 3)) {
      this.iterations = 1
    }
    this.generateSearchLegs()
  }

  generateSearchLegs () {
    this.searchLegs = []
    let currentBearing = this.startingDirection
    let lastPoint = { x: 0, y: 0 }
    const legLength = this.sweepWidth * this.multiplier
    for (let i = 1; i < (9 * this.iterations) + 1; i++) {
      const from = lastPoint
      let to = { x: 0, y: 0 }
      if ((i % 3) !== 0) {
        to = move(from, currentBearing, legLength)
      }
      this.searchLegs.push(new SearchLeg(from, to, legLength, currentBearing))
      if ((i % 3) === 0) {
        if ((i % 9) === 0) {
          currentBearing = (currentBearing + 30) % 360
        }
      } else {
        currentBearing = (currentBearing + 120) % 360
      }
      lastPoint = to
    }
  }
}

class ExpandingBoxSearch extends SearchPattern {
  constructor (sweepWidth, iterations, startingDirection) {
    super(sweepWidth)
    this.searchType = 'expandingbox'
    this.iterations = Number(iterations)
    this.startingDirection = Number(startingDirection)
    this.generateSearchLegs()
  }

  generateSearchLegs () {
    this.searchLegs = []
    let direction = this.startingDirection
    let from = { x: 0, y: 0 }
    for (let i = 0; i < (this.iterations * 4); i++) {
      const legLength = this.sweepWidth * (1 + Math.round((i - 1) / 2))
      const to = move(from, direction, legLength)
      this.searchLegs.push(new SearchLeg(from, to, this.sweepWidth * (1 + Math.round((i - 1) / 2)), direction))
      direction = (direction + 90) % 360
      from = to
    }
  }
}

class CreepingLineAheadSearch extends SearchPattern {
  constructor (sweepWidth, legLength, legs, progressDirection) {
    super(sweepWidth)
    this.searchType = 'creepingline'
    this.legLength = Number(legLength)
    this.legs = Number(legs)
    this.progressDirection = Number(progressDirection)
    this.generateSearchLegs()
  }

  generateSearchLegs () {
    this.searchLegs = []
    const baseNear = { x: 0, y: 0 }
    const baseFar = move(baseNear, this.progressDirection + 90, this.legLength)
    for (let i = 1; i < (this.legs * 2); i++) {
      let direction = this.progressDirection
      let from
      let to
      let distance
      const leg = Math.round(i / 2)
      if ((i % 4) === 0) {
        from = move(baseNear, this.progressDirection, this.sweepWidth * leg)
        to = move(baseNear, this.progressDirection, this.sweepWidth * (leg + 1))
        distance = this.sweepWidth
      } else if ((i % 4) === 1) {
        from = move(baseNear, this.progressDirection, this.sweepWidth * leg)
        to = move(baseFar, this.progressDirection, this.sweepWidth * leg)
        direction = (direction + 90) % 360
        distance = this.legLength
      } else if ((i % 4) === 2) {
        from = move(baseFar, this.progressDirection, this.sweepWidth * leg)
        to = move(baseFar, this.progressDirection, this.sweepWidth * (leg + 1))
        distance = this.sweepWidth
      } else {
        from = move(baseFar, this.progressDirection, this.sweepWidth * leg)
        to = move(baseNear, this.progressDirection, this.sweepWidth * leg)
        direction = (direction + 270) % 360
        distance = this.legLength
      }
      this.searchLegs.push(new SearchLeg(from, to, distance, direction))
    }
  }
}

export { SearchPattern, SectorSearch, ExpandingBoxSearch, CreepingLineAheadSearch }
