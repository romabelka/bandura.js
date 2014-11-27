# Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

prepareStr = (str) ->
  return _(str).chain().clean().trim().slugify().value()

isStringAndNonEmpty = (str) -> return typeof str is 'string' and str.length > 0

###

  сбор абсолютно всех возможных ивентов - вьюшки, браузер, апишка
  декларативность ивентов
  унификация ивентов
  валидация ивентов
  ! логгирование ивентов
  подготовка данных для логики

###

class @Actions

  instances = []

  constructor: (rawNamespace, actions) ->
    if not isStringAndNonEmpty(rawNamespace)
      throw  Error 'Namespace must be non-empty string'

    namespace = prepareStr(rawNamespace)

    if _(instances).find({namespace: namespace})
      throw Error "You already have namespace by this name '#{namespace}'"

    else if (not _(actions).isObject()) or _(actions).isEmpty()
      throw  Error "Actions-hash must be non-empty"

    @namespace = namespace
    @actions = actions

    instances.push(@)


  getActionByName: (eventName) ->
    throw  Error 'eventName must be string and non-empty' unless isStringAndNonEmpty(eventName)
    return @actions[eventName]

  ### STATIC ###
  @getByNamespace: (namespace) ->
    return _(instances).find(namespace: namespace)

  # Actions.mixin()
  @mixin: ->
    return {
      senderAction: (->
        return -> @sendAction.apply(@, arguments)
      )
      sendAction: ((eventStr, extra) ->
        eventArr = eventStr.split('.')

        if eventArr.length < 2
          throw  Error "Actions must have action-namespace and action-name"

        [namespace, eventName] = eventArr

        actionInstance = Actions.getByNamespace(namespace)

        unless actionInstance?
          throw  Error "You dont have action-namespace with name '#{namespace}'"

        eventHandle = actionInstance.getActionByName(eventName)

        unless eventHandle?
          throw  Error "eventHandle '#{eventName}' is not found in namespace '#{namespace}'"

        return eventHandle(eventArr, extra)
      )
    }