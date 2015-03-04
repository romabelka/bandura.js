window.Utils =
  extendImmutable: (arg...) ->
    _.extend.apply @, [{}].concat(arg)

  randomId: ->
    Math.floor Math.random()*900 + 100

  insertOn: (array, elements, position) ->
    array[...position].concat elements, array[position..]

  removeFrom: (array, position) ->
    array[...position].concat array[position..]

  allIndexOf: (array, element) ->
    _.reduce(array, (acc, el, index) ->
      if el is element then acc.concat(index) else acc
    , [])

module.exports = Utils