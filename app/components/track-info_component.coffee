`/** @jsx React.DOM */`

{PropTypes, createClass, addons} = require('../../bower_components/react/react-with-addons.js')

Actions = require('../core/actions')
Store = require('../core/store')

module.exports = createClass
  displayName: 'TrackInfo'

  propTypes:
    store: PropTypes.store

  classSet: ->
    {} = @props
    {} = @state

    return addons.classSet({

    })


  mixins: [Store.subscribe()]

  filterDataFromStore: (store) ->
    console.log "#{@constructor.displayName}::filterDataFromStore", store

    return {
      track: _(store.tracks).findWhere id: store.playing.track_id
    }

  render: ->
    console.log("#{@constructor.displayName}::RENDER")
    {id, name, genre, artist, album} = @getDataFromStore().track

    return `<div className={this.classSet()}>
      <h6>current track: {id} - {name}</h6>
      <table>
        <tr>
          <td>genre:</td>
          <td>{genre}</td>
        </tr>
        <tr>
          <td>artist:</td>
          <td>{artist}</td>
        </tr>
        <tr>
          <td>album:</td>
          <td>{album}</td>
        </tr>
      </table>
    </div>`

