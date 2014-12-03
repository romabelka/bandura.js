class Snap
  constructor: (@store, @filter) ->

  getData: ->
    @filter(@store)
  check: ->
    # make check and trigger change if something change


class @ReactStore
  initial: {}
  snaps: []
  constructor: (obj) ->
    @sta

  createSnap: ({name, filter}) ->

