Storik = require('./storik')

class Store
  storiks = []
  commits = []

  constructor: (initialData) ->
    @update(initialData.initialSnapshot)

  validateChanges = (hash) ->
    return _.isObject(hash)

  update: (changes) ->
    if not validateChanges(changes)
      return console.error('Update data not valid!')

    commits.push(changes)

    @notify
      storiks: storiks # todo: only active storik
      snapshot: getLatestSnapshot()

    return

  getLatestSnapshot = ->
    return _.extend.apply(_, commits)

  notify: ({storiks, snapshot}) ->
    console.log 'notify', snapshot, storiks
    storik.check({snapshot}) for storik in storiks

  defaultOptions =
    filter: 'filterDataFromStore'
    getter: 'getDataFromStore'
    trigger: 'triggerDataFromStore'

  @subscribe: (options = {}) ->
    storik = new Storik(_.extend(
      {},
      defaultOptions,
      _.clone(options),
      {
        getLatestSnapshot: getLatestSnapshot
      }
    ))

    storiks.push(storik)

    return storik.getMixin()


module.exports = Store