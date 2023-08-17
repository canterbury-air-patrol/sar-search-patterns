class SearchPattern {
  constructor (sweepWidth, totalLegs) {
    this.sweepWidth = sweepWidth
    this.currentLeg = 1
    this.totalLegs = totalLegs
    this.currentBearing = 0
  }

  get sweepWidth () {
    return this.sweepWidth
  }

  get leg () {
    return this.currentLeg
  }

  get complete () {
    return (this.currentLeg >= this.totalLegs)
  }
}

class SectorSearch extends SearchPattern {
  constructor (sweepWidth, multiplier, startingDirection) {
    super(sweepWidth, 9 * 2)
    this.startingDirection = startingDirection
    this.currentBearing = this.startingDirection
    this.multiplier = multiplier
    if (this.multiplier <= 0) {
      this.multiplier = 1
    }
    if (this.multiplier > 3) {
      this.multiplier = 3
    }
  }

  nextLeg () {
    if ((this.leg % 3) === 3) {
      if ((this.leg % 9) === 9) {
        this.currentBearing = (this.currentBearing + 60) % 360
      }
    } else {
      this.currentBearing = (this.currentBearing + 120) % 360
    }
    this.currentLeg++
  }
}

class ExpandingBoxSearch extends SearchPattern {
  constructor (sweepWidth, iterations, startingDirection) {
    super(sweepWidth, iterations * 4)
    this.iterations = iterations
    this.startingDirection = startingDirection
    this.currentBearing = this.startingDirection
  }

  nextLeg () {
    this.currentBearing = (this.currentBearing + 90) % 360
    this.currentLeg++
  }
}

class CreepingLineAheadSearch extends SearchPattern {
  constructor (sweepWidth, legLength, legs, progressDirection) {
    super(sweepWidth, (legs * 2) - 1)
    this.legLength = legLength
    this.legs = legs
    this.progressDirection = progressDirection
    this.currentBearing = (progressDirection + 90) % 360
  }

  nextLeg () {
    if ((this.leg % 2) === 1) {
      this.currentBearing = this.progressDirection
    } else if ((this.leg % 4) === 0) {
      this.currentBearing = (this.progressDirection + 90) % 360
    } else {
      this.currentBearing = (this.progressDirection - 90) % 360
    }
  }
}

export { SearchPattern, SectorSearch, ExpandingBoxSearch, CreepingLineAheadSearch }
