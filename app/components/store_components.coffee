`/** @jsx React.DOM */`

{PropTypes, createClass, PropTypes, addons} = React

trackPropTypes =
  id: PropTypes.string
  name: PropTypes.string
  genre: PropTypes.oneOf([
    'rock'
    'pop'
    'jazz'
    'funk'
    'rap'
    'horror'
  ])
  artist: PropTypes.string
  album: PropTypes.string
  isPlaying: PropTypes.bool

#'col-md': PropTypes.number

Track = createClass
  propTypes: trackPropTypes

  classSet: ->
    {isPlaying} = @props
    return addons.classSet({
      'is-play': isPlaying
      'bg-info': yes
    })

  render: ->
    {isPlaying, id, name, genre, artist, album} = @props

    return `<div class={this.classSet()}>
      <h6>{id} - {name}</h6>
      <table>
        <tr>
          <td>isPlaying</td>
          <td>{isPlaying}</td>
        </tr>
        <tr>
          <td>genre</td>
          <td>{genre}</td>
        </tr>
        <tr>
          <td>artist</td>
          <td>{artist}</td>
        </tr>
        <tr>
          <td>album</td>
          <td>{album}</td>
        </tr>
      </table>
    </div>`


Playlist = createClass
  propTypes:
    id: PropTypes.number
    name: PropTypes.string
    type: PropTypes.string
    isPlaying: PropTypes.bool
    tracks: PropTypes.arrayOf(PropTypes.shape(trackPropTypes))

  classSet: ->
    {isPlaying} = @props
    return addons.classSet({
      'panel': yes
      'is-play': isPlaying
    })

  render: ->
    {id, name, type, tracks} = @props

    tracksElements = tracks.map (track) ->
      colMd = 3
      return `<Track
                key={track.id}

                id={track.id}
                name={track.name}
                genre={track.genre}
                artist={track.artist}
                album={track.album}
                isPlaying={track.isPlaying}

                col-md={colMd}
                />`

    return `<div class={this.classSet()}>
      <h4>id: {id}, name: {name}, type: {type}</h4>
      <b>isPlaying: {isPlaying}</b>
      <div class='row'>
        {tracksElements}
      </div>
    </div>`


Controls = createClass
  mixins: [store.subscribe()]

  propTypes:
    store: PropTypes.store

  classSet: ->
    {} = @props
    {} = @state

    return addons.classSet({

    })

  render: ->
    {} = @props
    {} = @state

    return `<div class={this.classSet()}>

    </div>`

