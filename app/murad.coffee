React = require('../bower_components/react/react-with-addons')
{renderComponent, PropTypes} = React
Bandura = require('./components/bandura_component')
{isDevEnv} = require('./config')

do ->
  PropTypes.store = PropTypes.object
  window.React = React if isDevEnv

try
  document.addEventListener "DOMContentLoaded", (event) ->
    console.log 'DOMContentLoaded'

    renderComponent(`<Bandura store={store} />`,
      document.getElementById('bandura-container')
    )

    setTimeout(->
      console.log '------------------------------------ changes next'
      store.update({playing: {
        track_id: "rrmusic:track:120" + _([4..9]).shuffle()[0]
      }})
    , 1500)
catch e
  # todo: глобальный перехватчик и регистратор ошибок
  console.error('ERROR: ', e)