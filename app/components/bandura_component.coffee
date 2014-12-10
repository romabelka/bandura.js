Actions = require('../core/actions')
Store = require('../core/store')
TrackInfo = require('./track-info_component')
{PropTypes, createClass, PropTypes, addons} = require('../../bower_components/react/react-with-addons.js')


Bandura = createClass
  displayName: 'Bandura'

  mixins: [Store.subscribe(), Actions.mixin()]

  propTypes:
    store: PropTypes.store

  filterDataFromStore: (store) ->
    console.log "#{@constructor.displayName}::filterDataFromStore", store

    return {
      status: store.status
    }

  classSet: ->
    {} = @props
    {} = @state

    return addons.classSet({

    })

  render: ->
    console.log("#{@constructor.displayName}::RENDER")

    {status} = @getDataFromStore()
    {store} = @props
    {} = @state

    onClick = this.senderAction('controls.play', {fuck: 'suck'})

    return `<div className={this.classSet()}>
        <h4 onClick={onClick}>Status: {status}</h4>
        <hr />
        <TrackInfo store={store}/>
    </div>`


module.exports = Bandura