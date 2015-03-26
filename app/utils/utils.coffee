window.Utils =
  extendImmutable: (arg...) ->
    _.extend.apply @, [{}].concat(arg)

  randomId: ->
    Math.floor Math.random()*900 + 100

  insertOn: (array, elements, position) ->
    array[...position].concat elements, array[position+1..]

  removeFrom: (array, position) ->
    array[...position].concat array[position...]

  updateOn: (array, position, newVal) ->
    @insertOn(@removeFrom(array,position), newVal, position)

  allIndexOf: (array, element) ->
    _.reduce(array, (acc, el, index) ->
      if el is element then acc.concat(index) else acc
    , [])

  extend: (a,args...)->
    args.forEach (obj) ->
      for key of obj
        a[key] = obj[key] if obj.hasOwnProperty(key) and obj[key]?
    return a



module.exports = Utils