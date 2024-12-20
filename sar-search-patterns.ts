class xy {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

class SearchLeg {
  from: xy
  to: xy
  bearing: number
  distance: number
  constructor(from: xy, to: xy, distance: number, bearing: number) {
    this.from = from
    this.to = to
    this.bearing = bearing
    this.distance = distance
  }
}

class SearchPattern {
  sweepWidth: number
  searchLegs: SearchLeg[]
  currentLeg: number
  searchType?: string

  constructor(sweepWidth: number) {
    this.sweepWidth = sweepWidth
    this.searchLegs = []
    this.currentLeg = 1
  }

  get leg(): SearchLeg {
    return this.searchLegs[this.currentLeg - 1]
  }

  get complete(): boolean {
    return this.currentLeg > this.searchLegs.length
  }

  get length(): number {
    let length = 0
    for (const legIdx in this.searchLegs) {
      const tmpLeg = this.searchLegs[legIdx]
      length += tmpLeg.distance
    }
    return length
  }

  getLegs() {
    return this.searchLegs
  }

  nextLeg() {
    this.currentLeg++
  }

  uniqueKey(): string {
    return `${this.searchType}-${this.sweepWidth}-${this.searchLegs}-${this.currentLeg}`
  }
}

function move(from: xy, direction: number, distance: number) {
  const to = { x: 0, y: 0 }
  const rads = (direction * Math.PI) / 180
  to.x = from.x + Math.sin(rads) * distance
  to.y = from.y + Math.cos(rads) * distance
  return to
}

class SectorSearch extends SearchPattern {
  startingDirection: number
  multiplier: number
  iterations: number

  constructor(sweepWidth: number, multiplier: number, iterations: number, startingDirection: number) {
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

  generateSearchLegs() {
    this.searchLegs = []
    let currentBearing = this.startingDirection
    let lastPoint = { x: 0, y: 0 }
    const legLength = this.sweepWidth * this.multiplier
    for (let i = 1; i < 9 * this.iterations + 1; i++) {
      const from = lastPoint
      let to = { x: 0, y: 0 }
      if (i % 3 !== 0) {
        to = move(from, currentBearing, legLength)
      }
      this.searchLegs.push(new SearchLeg(from, to, legLength, currentBearing))
      if (i % 3 === 0) {
        if (i % 9 === 0) {
          currentBearing = (currentBearing + 30) % 360
        }
      } else {
        currentBearing = (currentBearing + 120) % 360
      }
      lastPoint = to
    }
  }

  uniqueKey(): string {
    return `${this.searchType}-${this.sweepWidth}-${this.searchLegs}-${this.currentLeg}-${this.startingDirection}-${this.multiplier}-${this.iterations}`
  }
}

class ExpandingBoxSearch extends SearchPattern {
  iterations: number
  startingDirection: number

  constructor(sweepWidth: number, iterations: number, startingDirection: number) {
    super(sweepWidth)
    this.searchType = 'expandingbox'
    this.iterations = iterations
    this.startingDirection = Number(startingDirection)
    this.generateSearchLegs()
  }

  generateSearchLegs() {
    this.searchLegs = []
    let direction = this.startingDirection
    let from = { x: 0, y: 0 }
    for (let i = 0; i < this.iterations * 4; i++) {
      const legLength = this.sweepWidth * (1 + Math.round((i - 1) / 2))
      const to = move(from, direction, legLength)
      this.searchLegs.push(new SearchLeg(from, to, this.sweepWidth * (1 + Math.round((i - 1) / 2)), direction))
      direction = (direction + 90) % 360
      from = to
    }
  }

  uniqueKey(): string {
    return `${this.searchType}-${this.sweepWidth}-${this.searchLegs}-${this.currentLeg}-${this.startingDirection}-${this.iterations}`
  }
}

class CreepingLineAheadSearch extends SearchPattern {
  legLength: number
  legs: number
  progressDirection: number

  constructor(sweepWidth: number, legLength: number, legs: number, progressDirection: number) {
    super(sweepWidth)
    this.searchType = 'creepingline'
    this.legLength = Number(legLength)
    this.legs = Number(legs)
    this.progressDirection = Number(progressDirection)
    this.generateSearchLegs()
  }

  generateSearchLegs() {
    this.searchLegs = []
    const baseNear: xy = new xy(0, 0)
    const baseFar = move(baseNear, this.progressDirection + 90, this.legLength)
    for (let i = 1; i < this.legs * 2; i++) {
      let direction = this.progressDirection
      let from
      let to
      let distance
      const leg = Math.round(i / 2)
      if (i % 4 === 0) {
        from = move(baseNear, this.progressDirection, this.sweepWidth * leg)
        to = move(baseNear, this.progressDirection, this.sweepWidth * (leg + 1))
        distance = this.sweepWidth
      } else if (i % 4 === 1) {
        from = move(baseNear, this.progressDirection, this.sweepWidth * leg)
        to = move(baseFar, this.progressDirection, this.sweepWidth * leg)
        direction = (direction + 90) % 360
        distance = this.legLength
      } else if (i % 4 === 2) {
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

  uniqueKey(): string {
    return `${this.searchType}-${this.sweepWidth}-${this.searchLegs}-${this.currentLeg}-${this.legLength}-${this.legs}-${this.progressDirection}`
  }
}

export { SearchPattern, SearchLeg, SectorSearch, ExpandingBoxSearch, CreepingLineAheadSearch }
