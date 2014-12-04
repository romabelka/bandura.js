Actions = require('../core/actions')
Store = require('../core/store')
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
    @sendAction('controls.play', {fuck: 'suck'})

    {status} = @getDataFromStore()
    {} = @props
    {} = @state

    return `<div className={this.classSet()}>
        <h4>Status: {status}</h4>
        <hr />
        <TrackInfo store={store}/>
    </div>`


module.exports = Bandura