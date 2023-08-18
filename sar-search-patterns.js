class SearchLeg {
  constructor (from, to, bearing) {
    this.from = from
    this.to = to
    this.bearing = bearing
  }
}

class SearchPattern {
  constructor (sweepWidth) {
    this.sweepWidth = sweepWidth
    this.searchLegs = []
    this.currentLeg = 1
  }

  get leg () {
    return this.searchLegs[this.currentLeg - 1]
  }

  get complete () {
    return (this.currentLeg >= this.searchLegs.length)
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
  constructor (sweepWidth, multiplier, startingDirection) {
    super(sweepWidth)
    this.startingDirection = startingDirection
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
    this.generateSearchLegs()
  }

  generateSearchLegs () {
    this.searchLegs = []
    let currentBearing = this.startingDirection
    let lastPoint = { x: 0, y: 0 }
    for (let i = 1; i < (9 * 1) + 1; i++) {
      const from = lastPoint
      let to = { x: 0, y: 0 }
      if ((i % 3) !== 0) {
        to = move(from, currentBearing, this.sweepWidth * this.multiplier)
      }
      this.searchLegs.push(new SearchLeg(from, to, currentBearing))
      if ((i % 3) === 0) {
        if ((i % 9) === 0) {
          currentBearing = (currentBearing + 60) % 360
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
    this.iterations = iterations
    this.startingDirection = startingDirection
    this.generateSearchLegs()
  }

  generateSearchLegs () {
    this.searchLegs = []
    let direction = this.startingDirection
    let from = { x: 0, y: 0 }
    for (let i = 0; i < (this.iterations * 4); i++) {
      const to = move(from, direction, this.sweepWidth * (1 + (i / 2)))
      this.searchLegs.push(new SearchLeg(from, to, direction))
      direction = (direction + 90 % 360)
      from = to
    }
  }
}

class CreepingLineAheadSearch extends SearchPattern {
  constructor (sweepWidth, legLength, legs, progressDirection) {
    super(sweepWidth)
    this.legLength = legLength
    this.legs = legs
    this.progressDirection = progressDirection
    this.currentBearing = (progressDirection + 90) % 360
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
      if ((i % 4) === 0) {
        from = move(baseNear, this.progressDirection, this.sweepWidth * Math.round(i / 2))
        to = move(baseNear, this.progressDirection, this.sweepWidth * (Math.round(i / 2) + 1))
      } else if ((i % 4) === 1) {
        from = move(baseNear, this.progressDirection, this.sweepWidth * Math.round(i / 2))
        to = move(baseFar, this.progressDirection, this.sweepWidth * Math.round(i / 2))
        direction = (direction + 90) % 360
      } else if ((i % 4) === 2) {
        from = move(baseFar, this.progressDirection, this.sweepWidth * Math.round(i / 2))
        to = move(baseFar, this.progressDirection, this.sweepWidth * (Math.round(i / 2) + 1))
      } else {
        from = move(baseFar, this.progressDirection, this.sweepWidth * Math.round(i / 2))
        to = move(baseNear, this.progressDirection, this.sweepWidth * (Math.round(i / 2)))
        direction = (direction - 90) % 360
      }
      this.searchLegs.push(new SearchLeg(from, to, direction))
    }
  }
}

export { SearchPattern, SectorSearch, ExpandingBoxSearch, CreepingLineAheadSearch }
