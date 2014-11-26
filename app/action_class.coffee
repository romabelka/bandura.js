prepareStr = (str) -> return _(str).chain().clean().trim().slugify()

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

  constructor: (namespace, actions) ->
    if not isStringAndNonEmpty(namespace)
      throw  Error 'Namespace must be non-empty string'

    name = prepareStr(namespace)

    if _(instances).find name: name
      throw  Error "You already have namespace by this name '#{namespace}'"

    else if (not _(actions).isObject()) or _(actions).isEmpty()
      throw  Error "Actions-hash must be non-empty"

    @namespace = name
    @actions = actions

  getAction: (eventName) ->
    throw  Error 'eventName must be string and non-empty' if isStringAndNonEmpty(eventName)
    return @actions[eventName]

  # Actions.mixin()
  @mixin: ->
    return {
      senderAction: (->
        return -> @sendAction.apply(@, arguments)
      )
      sendAction: ((name, extra) ->
        name = name.split('.')

        if name.length < 2
          throw  Error "Actions must have action-namespace and action-name"

        [namespace, eventName] = name

        instance = _(instances).find(name: namespace)

        unless instance?
          throw  Error "You dont have action-namespace with name '#{namespace}'"

        eventHandle = instance.getAction(eventName)

        unless eventHandle?
          throw  Error "eventHandle '#{eventName}' is not found in namespace '#{namespace}'"

        return eventHandle(name, extra)
      )
    }