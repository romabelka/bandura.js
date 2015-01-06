do require('./preconfig')
require('./actions/controls')

React = require('../bower_components/react/react-with-addons')
{renderComponent, PropTypes} = React
Bandura = require('./components/bandura_component')
{isDevEnv} = require('./config')
Store = require('./core/store')
initialSnapshot = require('./api/store_data')

do ->
  window.React = React if isDevEnv

try
  document.addEventListener "DOMContentLoaded", (event) ->
    console.log 'DOMContentLoaded'

    window.store = new Store(initialSnapshot)

    renderComponent(`<Bandura store={store} />`,
      document.getElementById('bandura-container')
    )

catch e
  # todo: глобальный перехватчик и регистратор ошибок
  console.error('ERROR: ', e)