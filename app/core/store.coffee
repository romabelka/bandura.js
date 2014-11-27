initial = {

}

window.store = new ReactStore
  initial: initial
  snaps: [
    {
      name: ''
      filter: ->
    }
  ]

store.getSnap()