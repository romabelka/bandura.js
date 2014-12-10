class Storik
  _currentState: {}

  getCurrentState: ->
    return @_currentState

  setCurrentState: (newState) ->
    @_currentState = newState

    # оповещаем компонент
    @component[@options.trigger]()

    return

  constructor: (@options) ->
    @_currentState = {}

  check: ({snapshot}) ->
    # прерываем если компонент еще не подписался или вызвал ошибку при регистрации ... todo: сделать отложенной подпиской на главный стор
    return unless @component?

    newState = @filterMethod(snapshot)
    console.log 'newState', @filterMethod, snapshot

    isEqual = _.isEqual(newState, @getCurrentState())
    console.log "#{@component.constructor.displayName}::check, isEqual: #{isEqual}", newState, @getCurrentState()

    return if isEqual

    @setCurrentState(newState)

  register: ({component, snapshot}) ->
    filterMethod = component[@options.filter]

    return console.error(": filter method #{@filter} is undefined") unless filterMethod?

    @component = component
    @filterMethod = filterMethod

    @check({snapshot})

    return

  getMixin: ->
    storik = @
    mixin = {}

    mixin.componentWillMount = (->
      console.log "#{@constructor.displayName}::componentWillMount", @, arguments

      snapshot = storik.options.getLatestSnapshot()
      console.log 'componentWillMount:snapshot', snapshot
      storik.register({component: @, snapshot})
    )

    mixin[storik.options.trigger] = ( ->
      console.log "#{@constructor.displayName}::#{storik.options.trigger}", @, arguments
      @forceUpdate()
    )

    mixin[storik.options.getter] = (->
      return storik.getCurrentState()
    )

    mixin['shouldComponentUpdate'] = (->

    )
    return mixin

###
  @todo:
  - верхний элемент все равно вызывает rerender == shouldComponentUpdate

  - надо подумать что делать с двойной проверкой,
    которая возникает если дочерний элемент пошел на проверку,
    а потом родительский обновился и соответственно вызвал ререндер
###


module.exports = Storik